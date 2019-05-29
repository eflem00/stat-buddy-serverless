const moment = require('moment');

const index = 'events2';
const type = 'event';

module.exports = function parseLivePlays(gamePk, gameEvents, gameShifts) {
  const events = [];

  const gameData = {
    game_pk: gamePk,
    gametype: gameEvents.data.gameData.game.type,
    game_season: gameEvents.data.gameData.game.season,
    game_start_date: gameEvents.data.gameData.datetime.dateTime,
    game_end_date: gameEvents.data.gameData.datetime.endDateTime,
    venue: gameEvents.data.gameData.venue.name,
  };

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    const doc = { ...gameData };

    // Results
    doc.eventtype_id = play.result.eventTypeId;
    doc.event_code = play.result.eventCode;
    doc.event = play.result.event;
    doc.game_winning_goal = play.result.gameWinningGoal;
    if (play.result.strength !== undefined) {
      doc.strength = play.result.strength.code;
    }
    // About
    doc.event_idx = play.about.eventIdx;
    doc.event_id = play.about.eventId;
    doc.period = play.about.period;
    doc.periodtype = play.about.periodType;
    doc.ordinal_num = play.about.ordinalNum;
    doc.period_time = play.about.periodTime;
    doc.period_time_remaining = play.about.periodTimeRemaining;
    doc.date_time = play.about.dateTime;
    // Coordinates
    doc.x = play.coordinates.x;
    doc.y = play.coordinates.y;

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
      if (!playerAlreadyAdded && gameShift.period === play.about.period && ((playTime > startTime && playTime <= endTime) || (moment('00:00', 'mm:ss').isSame(playTime) && playTime >= startTime && playTime <= endTime))) {
        players.push({
          id: gameShift.playerId,
          type: 'OnIce',
        });
      }
    });
    doc.players = players;

    const id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push({
      index: {
        index,
        type,
        id,
      },
    });
    events.push(doc);
  });

  return events;
};
