const timeHelper = require('./timeHelper');
const constants = require('./constants');

module.exports = function parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties) {
  const events = [];

  const gameData = {
    gamePk,
    gameType: gameEvents.data.gameData.game.type,
    gameSeason: parseInt(gameEvents.data.gameData.game.season, 10),
    venue: gameEvents.data.gameData.venue.name,
  };

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    if (play.players && play.players.length > 0) {
      const doc = { ...gameData };

      doc.playTime = timeHelper.getTotalSeconds(play.about.period, play.about.periodTime, gameData.gameType);
      doc.periodType = play.about.periodType;
      doc.dateTime = play.about.dateTime;
      doc.eventTypeId = play.result.eventTypeId;
      if (play.result.gameWinningGoal) {
        doc.gameWinningGoal = play.result.gameWinningGoal;
      }
      if (play.result.secondaryType) {
        doc.secondaryType = play.result.secondaryType;
      }
      if (play.result.penaltySeverity) {
        doc.penaltySeverity = play.result.penaltySeverity;
      }
      if (play.result.penaltyMinutes) {
        doc.penaltyMinutes = play.result.penaltyMinutes;
      }
      if (play.coordinates && play.coordinates.x && play.coordinates.y) {
        doc.x = play.coordinates.x;
        doc.y = play.coordinates.y;
      }

      if (play.team) {
        doc.teamId = play.team.id;
        doc.teamStatus = play.team.id === gameEvents.data.gameData.teams.home.id ? constants.Home : constants.Away;
      }

      const homeTeamId = gameEvents.data.gameData.teams.home.id;
      const awayTeamId = gameEvents.data.gameData.teams.away.id;
      const playIsHome = doc.teamStatus === constants.Home;

      // TODO: Could be offsetting penalties?
      doc.penaltiesFor = 0;
      doc.penaltiesAgainst = 0;
      gamePenalties.forEach((penalty) => {
        if (doc.playTime >= penalty.startTime && doc.playTime <= penalty.endTime) {
          if (penalty.teamId === doc.teamId) {
            doc.penaltiesFor += 1;
          } else {
            doc.penaltiesAgainst += 1;
          }
        }
      });

      // Find players on the ice
      // TODO: Play time in overtime
      const players = new Set();
      doc.playerCount = 0;
      doc.opposingPlayerCount = 0;
      gameShifts.data.data.forEach((gameShift) => {
        const startTime = timeHelper.getTotalSeconds(gameShift.period, gameShift.startTime, gameData.gameType);
        const endTime = timeHelper.getTotalSeconds(gameShift.period, gameShift.endTime, gameData.gameType);
        const playTime = doc.playTime;

        if (playTime % 1200 !== 0 && startTime < playTime && playTime <= endTime) {
          players.add(gameShift.playerId);
          if (gameShift.teamId === doc.teamId) {
            doc.playerCount += 1;
          } else {
            doc.opposingPlayerCount += 1;
          }
        } else if (playTime % 1200 === 0 && gameShift.period === play.about.period && (startTime === playTime || playTime === endTime)) {
          players.add(gameShift.playerId);
          if (gameShift.teamId === doc.teamId) {
            doc.playerCount += 1;
          } else {
            doc.opposingPlayerCount += 1;
          }
        }
      });
      doc.players = Array.from(players);

      // Parse the original players array and split into multiple docs
      // Assign main player to main doc and create seconday doc
      doc.playerId = play.players[0].player.id;
      doc.handedness = gameEvents.data.gameData.players[`ID${doc.playerId}`].shootsCatches;
      if (play.players.length > 1) {
        for (let i = 1; i < play.players.length; i += 1) {
          const newDoc = { ...doc };
          const player = play.players[i];
          newDoc.playerId = player.player.id;
          newDoc.handedness = gameEvents.data.gameData.players[`ID${newDoc.playerId}`].shootsCatches;

          switch (doc.eventTypeId) {
            case constants.Hit:
              newDoc.eventTypeId = constants.Hittee;
              newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
              newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              events.push(newDoc);
              break;
            case constants.BlockedShot:
              newDoc.eventTypeId = constants.ShotBlocked;
              newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
              newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              events.push(newDoc);
              break;
            case constants.Shot:
              newDoc.eventTypeId = constants.Save;
              newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
              newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              events.push(newDoc);
              break;
            case constants.Faceoff:
              newDoc.eventTypeId = constants.FaceoffLoss;
              newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
              newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              events.push(newDoc);
              break;
            case constants.Penalty:
              newDoc.eventTypeId = constants.PenaltyDrawn;
              newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
              newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              events.push(newDoc);
              break;
            case constants.Goal:
              if (player.playerType === constants.GoalieType) {
                newDoc.eventTypeId = constants.GoalAllowed;
                newDoc.teamId = playIsHome ? awayTeamId : homeTeamId;
                newDoc.teamStatus = playIsHome ? constants.Away : constants.Home;
              } else {
                newDoc.eventTypeId = constants.Assist;
                newDoc.teamId = playIsHome ? homeTeamId : awayTeamId;
                newDoc.teamStatus = playIsHome ? constants.Home : constants.Away;
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
