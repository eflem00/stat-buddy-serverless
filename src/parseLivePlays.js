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

    doc.period = play.about.period;
    doc.period_type = play.about.periodType;
    doc.period_time = play.about.periodTime;
    doc.period_time_remaining = play.about.periodTimeRemaining;
    doc.date_time = play.about.dateTime;
    doc.event_type_id = play.result.eventTypeId;
    if (play.result.gameWinningGoal !== undefined) {
      doc.game_winning_goal = play.result.gameWinningGoal;
    }
    if (play.result.strength !== undefined) {
      doc.strength = play.result.strength.code;
    }
    if (play.result.secondaryType !== undefined) {
      doc.secondary_type = play.result.secondaryType;
    }
    if (play.coordinates && play.coordinates.x && play.coordinates.y) {
      doc.x = play.coordinates.x;
      doc.y = play.coordinates.y;
    }

    //Find players on the ice
    let players = [];
    gameShifts.data.data.forEach((gameShift) => {
      const startTime = moment(gameShift.startTime, 'mm:ss');
      const endTime = moment(gameShift.endTime, 'mm:ss');
      const playTime = moment(play.about.periodTime, 'mm:ss');

      // Two scenarios:
      // 1) the time of the event is 00:00 so we want to include those who started there shift at this time
      // 2) the time of the event is something else so we don't want to include those who started there shift at this time because for instance a goal was scored, the event is already over and a new unit has come out to play
      if (gameShift.period === play.about.period
        && (playTime > startTime && playTime <= endTime)) {
        players.push({
          id: gameShift.playerId,
        });
      } else if (gameShift.period === play.about.period
        && (moment('00:00', 'mm:ss').isSame(playTime) && playTime.isSame(startTime))) {
        players.push({
          id: gameShift.playerId,
        });
      }
    });
    doc.players = players;

    
    const homeTeamId = gameEvents.data.gameData.teams.home.id;
    const awayTeamId = gameEvents.data.gameData.teams.away.id;

    if (play.team !== undefined) {
      doc.team_id = play.team.id;
      doc.team_status = play.team.id === homeTeamId ? 'HOME' : 'AWAY';
    }

    // Parse the original players array and split into multiple docs
    // Assign main player to main doc and create seconday doc
    if (play.players !== undefined && play.players.length > 0) {
      doc.player_id = play.players[0].player.id;
      doc.handedness = gameEvents.data.gameData.players[`ID${doc.player_id}`].shootsCatches;

      if (play.players.length > 1) {
        for (let i = 1; i < play.players.length; i++) {
          const newDoc = {...doc};
          const player = play.players[i];
          newDoc.player_id = player.player.id;
          switch (doc.event_type_id) {
            case 'HIT':
              newDoc.event_type_id = 'HITTEE';
              newDoc.team_id = doc.team_status === 'HOME' ? awayTeamId : homeTeamId;
              newDoc.team_status = doc.team_status === 'HOME' ? 'AWAY' : 'HOME';
              break;
            case 'BLOCKED_SHOT':
              newDoc.event_type_id = 'SHOT_BLOCKED';
              newDoc.team_id = doc.team_status === 'HOME' ? awayTeamId : homeTeamId;
              newDoc.team_status = doc.team_status === 'HOME' ? 'AWAY' : 'HOME';
              break;
            case 'SHOT':
              newDoc.event_type_id = 'SAVE';
              newDoc.team_id = doc.team_status === 'HOME' ? awayTeamId : homeTeamId;
              newDoc.team_status = doc.team_status === 'HOME' ? 'AWAY' : 'HOME';
              break;
            case 'FACEOFF':
              newDoc.event_type_id = 'FACEOFF_LOSS';
              newDoc.team_id = doc.team_status === 'HOME' ? awayTeamId : homeTeamId;
              newDoc.team_status = doc.team_status === 'HOME' ? 'AWAY' : 'HOME';
              break;
            case 'GOAL':
              if (player.playerType == 'Goalie') {
                newDoc.event_type_id = 'GOAL_ALLOWED';
                newDoc.team_id = doc.team_status === 'HOME' ? awayTeamId : homeTeamId;
                newDoc.team_status = doc.team_status === 'HOME' ? 'AWAY' : 'HOME';
              } else {
                newDoc.event_type_id = 'ASSIST';
                newDoc.team_id = doc.team_status === 'HOME' ? homeTeamId : awayTeamId;
                newDoc.team_status = doc.team_status === 'HOME' ? 'HOME' : 'AWAY';
              }
              break;
            default :
              newDoc.event_type_id = 'UNKNOWN';
              newDoc.player_id = undefined;
              newDoc.team_id = undefined;
              newDoc.team_status = undefined;
              break;
          }
          events.push(newDoc);
        }
      }
    }
    events.push(doc);
    
  });

  return events;
};
