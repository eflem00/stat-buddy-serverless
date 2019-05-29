const moment = require('moment');

module.exports = function parseLivePlays(gamePk, gameEvents, gameShifts) {
  const events = [];

  const gameData = {
    game_pk: gamePk,
    game_type: gameEvents.data.gameData.game.type,
    game_season: gameEvents.data.gameData.game.season,
    venue: gameEvents.data.gameData.venue.name,
  };

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    const doc = { ...gameData };

    // Results
    doc.event_type_id = play.result.eventTypeId;
    doc.event_code = play.result.eventCode;
    doc.event = play.result.event;
    if (play.result.gameWinningGoal !== undefined) {
      doc.game_winning_goal = play.result.gameWinningGoal;
    }
    if (play.result.strength !== undefined) {
      doc.strength = play.result.strength.code;
    }

    // About
    doc.event_idx = play.about.eventIdx;
    doc.event_id = play.about.eventId;
    doc.period = play.about.period;
    doc.period_type = play.about.periodType;
    doc.ordinal_num = play.about.ordinalNum;
    doc.period_time = play.about.periodTime;
    doc.period_time_remaining = play.about.periodTimeRemaining;
    doc.date_time = play.about.dateTime;

    // Coordinates
    if (play.coordinates !== undefined) {
      doc.x = play.coordinates.x;
      doc.y = play.coordinates.y;
    }

    const teams = [];
    if (play.team !== undefined) {
      const primaryTeamHome = play.team.id === gameEvents.data.gameData.teams.home.id;
      // Primary Team
      teams.push({
        id: play.team.id,
        status: primaryTeamHome ? 'Home' : 'Away',
        type: 'Primary',
        goals: primaryTeamHome ? play.about.goals.home : play.about.goals.away,
      });
      // Secondary Team
      teams.push({
        id: primaryTeamHome ? gameEvents.data.gameData.teams.away.id : gameEvents.data.gameData.teams.home.id,
        status: primaryTeamHome ? 'Away' : 'Home',
        type: 'Secondary',
        goals: primaryTeamHome ? play.about.goals.away : play.about.goals.home,
      });
    }
    doc.teams = teams;

    // Players involved in play
    let players = [];
    if (play.players !== undefined) {
      players = play.players.map((player) => {
        return {
          id: player.player.id,
          type: player.playerType,
          handedness: gameEvents.data.gameData.players[`ID${player.player.id}`].shootsCatches,
        };
      });
    }

    // Players on ice for event
    gameShifts.data.data.forEach((gameShift) => {
      const startTime = moment(gameShift.startTime, 'mm:ss');
      const endTime = moment(gameShift.endTime, 'mm:ss');
      const playTime = moment(play.about.periodTime, 'mm:ss');
      const playerAlreadyAdded = players.some(player => player.id === gameShift.playerId);

      // Two scenarios:
      // 1) the time of the event is 00:00 so we want to include those who started there shift at this time
      // 2) the time of the event is something else so we don't want to include those who started there shift at this time because for instance a goal was scored, the event is already over and a new unit has come out to play
      if (!playerAlreadyAdded
        && gameShift.period === play.about.period
        && (playTime > startTime && playTime <= endTime)) {
        players.push({
          id: gameShift.playerId,
          type: 'OnIce',
        });
      } else if (!playerAlreadyAdded
        && gameShift.period === play.about.period
        && (moment('00:00', 'mm:ss').isSame(playTime) && playTime.isSame(startTime))) {
        players.push({
          id: gameShift.playerId,
          type: 'OnIce',
        });
      }
    });
    doc.players = players;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
  });

  return events;
};
