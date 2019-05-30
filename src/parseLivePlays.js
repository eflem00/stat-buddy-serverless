const moment = require('moment');

function getTotalSeconds(period, time) {
  const momentTime = moment(time, 'mm:ss');
  let seconds = (momentTime.minutes() * 60) + momentTime.seconds();
  for (let i = 1; i < period; i++) {
    seconds += 1200;
  }
  return seconds;
}

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

    doc.play_time = getTotalSeconds(play.about.period, play.about.periodTime);
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
    let players = new Set();
    gameShifts.data.data.forEach((gameShift) => {
      const startTime = getTotalSeconds(gameShift.period, gameShift.startTime);
      const endTime = getTotalSeconds(gameShift.period, gameShift.endTime);
      const playTime = doc.play_time;

      if (playTime % 1200 !== 0 && startTime < playTime && playTime <= endTime) {
        players.add(gameShift.playerId);
      } else if (playTime % 1200 === 0 && startTime === playTime && playTime < endTime) {
        players.add(gameShift.playerId);
      }
    });
    doc.players = Array.from(players);
    
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
          newDoc.handedness = gameEvents.data.gameData.players[`ID${newDoc.player_id}`].shootsCatches;
          
          const playIsHome = doc.team_status === 'HOME';
          switch (doc.event_type_id) {
            case 'HIT':
              newDoc.event_type_id = 'HITTEE';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              break;
            case 'BLOCKED_SHOT':
              newDoc.event_type_id = 'SHOT_BLOCKED';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              break;
            case 'SHOT':
              newDoc.event_type_id = 'SAVE';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              break;
            case 'FACEOFF':
              newDoc.event_type_id = 'FACEOFF_LOSS';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              break;
            case 'GOAL':
              if (player.playerType == 'Goalie') {
                newDoc.event_type_id = 'GOAL_ALLOWED';
                newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
                newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              } else {
                newDoc.event_type_id = 'ASSIST';
                newDoc.team_id = playIsHome ? homeTeamId : awayTeamId;
                newDoc.team_status = playIsHome ? 'HOME' : 'AWAY';
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
