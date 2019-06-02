const getTotalSeconds = require('./getTotalSeconds');

module.exports = function parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties) {
  const events = [];

  const gameData = {
    game_pk: gamePk,
    game_type: gameEvents.data.gameData.game.type,
    game_season: gameEvents.data.gameData.game.season,
    venue: gameEvents.data.gameData.venue.name,
  };

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    if (play.players && play.players.length > 0) {
      const doc = { ...gameData };

      doc.play_time = getTotalSeconds(play.about.period, play.about.periodTime);
      doc.date_time = play.about.dateTime;
      doc.event_type_id = play.result.eventTypeId;
      if (play.result.gameWinningGoal) {
        doc.game_winning_goal = play.result.gameWinningGoal;
      }
      if (play.result.secondaryType) {
        doc.secondary_type = play.result.secondaryType;
      }
      if (play.result.strength) {
        doc.strength = play.result.strength.code;
      }
      if (play.result.penaltySeverity) {
        doc.penalty_severity = play.result.penaltySeverity;
      }
      if (play.result.penaltyMinutes) {
        doc.penalty_minutes = play.result.penaltyMinutes;
      }
      if (play.coordinates && play.coordinates.x && play.coordinates.y) {
        doc.x = play.coordinates.x;
        doc.y = play.coordinates.y;
      }

      if (play.team) {
        doc.team_id = play.team.id;
        doc.team_status = play.team.id === gameEvents.data.gameData.teams.home.id ? 'HOME' : 'AWAY';
      }

      const homeTeamId = gameEvents.data.gameData.teams.home.id;
      const awayTeamId = gameEvents.data.gameData.teams.away.id;
      const playIsHome = doc.team_status === 'HOME';

      // TODO: Could be offsetting penalties?
      doc.penalties_for = 0;
      doc.penalties_against = 0;
      gamePenalties.forEach((penalty) => {
        if (doc.play_time >= penalty.startTime && doc.play_time <= penalty.endTime) {
          if (penalty.teamId === doc.team_id) {
            doc.penalties_for += 1;
          } else {
            doc.penalties_against += 1;
          }
        }
      });

      // Find players on the ice
      const players = new Set();
      gameShifts.data.data.forEach((gameShift) => {
        const startTime = getTotalSeconds(gameShift.period, gameShift.startTime);
        const endTime = getTotalSeconds(gameShift.period, gameShift.endTime);
        const playTime = doc.play_time;

        if (playTime % 1200 !== 0 && startTime < playTime && playTime <= endTime) {
          players.add(gameShift.playerId);
        } else if (playTime % 1200 === 0 && gameShift.period === play.about.period && (startTime === playTime || playTime === endTime)) {
          players.add(gameShift.playerId);
        }
      });
      doc.players = Array.from(players);

      // Parse the original players array and split into multiple docs
      // Assign main player to main doc and create seconday doc
      doc.player_id = play.players[0].player.id;
      doc.handedness = gameEvents.data.gameData.players[`ID${doc.player_id}`].shootsCatches;
      if (play.players.length > 1) {
        for (let i = 1; i < play.players.length; i += 1) {
          const newDoc = { ...doc };
          const player = play.players[i];
          newDoc.player_id = player.player.id;
          newDoc.handedness = gameEvents.data.gameData.players[`ID${newDoc.player_id}`].shootsCatches;

          switch (doc.event_type_id) {
            case 'HIT':
              newDoc.event_type_id = 'HITTEE';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              events.push(newDoc);
              break;
            case 'BLOCKED_SHOT':
              newDoc.event_type_id = 'SHOT_BLOCKED';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              events.push(newDoc);
              break;
            case 'SHOT':
              newDoc.event_type_id = 'SAVE';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              events.push(newDoc);
              break;
            case 'FACEOFF':
              newDoc.event_type_id = 'FACEOFF_LOSS';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              events.push(newDoc);
              break;
            case 'PENALTY':
              newDoc.event_type_id = 'PENALTY_DRAWN';
              newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
              newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              events.push(newDoc);
              break;
            case 'GOAL':
              if (player.playerType === 'Goalie') {
                newDoc.event_type_id = 'GOAL_ALLOWED';
                newDoc.team_id = playIsHome ? awayTeamId : homeTeamId;
                newDoc.team_status = playIsHome ? 'AWAY' : 'HOME';
              } else {
                newDoc.event_type_id = 'ASSIST';
                newDoc.team_id = playIsHome ? homeTeamId : awayTeamId;
                newDoc.team_status = playIsHome ? 'HOME' : 'AWAY';
              }
              events.push(newDoc);
              break;
          }
        }
      }
      events.push(doc);
    }
  });

  return events;
};
