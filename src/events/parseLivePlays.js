const timeHelper = require('./timeHelper');
const constants = require('./constants');

module.exports = function parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls) {
  const events = [];

  // Process plays
  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    if (play.players && play.team && play.players.length > 0) {
      const doc = { gamePk };

      const playerId = play.players[0].player.id;
      doc.playerId = playerId;
      doc.handedness = gameEvents.data.gameData.players[`ID${playerId}`].shootsCatches;

      // Event data
      doc.dateTime = new Date(play.about.dateTime);
      doc.eventTypeId = play.result.eventTypeId;
      doc.playTime = timeHelper.getTotalSeconds(play.about.period, play.about.periodTime, gameEvents.data.gameData.game.type);

      // Team data
      const teamIsHome = play.team.id === gameEvents.data.gameData.teams.home.id;
      doc.teamId = play.team.id;
      doc.teamStatus = teamIsHome ? constants.Home : constants.Away;
      doc.teamScore = teamIsHome ? play.about.goals.home : play.about.goals.away;
      doc.opposingTeamId = teamIsHome ? gameEvents.data.gameData.teams.away.id : gameEvents.data.gameData.teams.home.id;
      doc.opposingTeamScore = teamIsHome ? play.about.goals.away : play.about.goals.home;

      // Additional info
      if (play.result.gameWinningGoal !== undefined) {
        doc.gameWinningGoal = play.result.gameWinningGoal;
      }
      if (play.result.emptyNet !== undefined) {
        doc.emptyNet = play.result.emptyNet;
      }
      if (play.result.secondaryType !== undefined) {
        doc.secondaryType = play.result.secondaryType;
      }
      if (play.result.penaltySeverity !== undefined) {
        doc.penaltySeverity = play.result.penaltySeverity;
      }
      if (play.result.penaltyMinutes !== undefined) {
        doc.penaltyMinutes = play.result.penaltyMinutes;
      }
      if (play.coordinates !== undefined && play.coordinates.x !== undefined && play.coordinates.y !== undefined) {
        doc.x = play.coordinates.x;
        doc.y = play.coordinates.y;
      }

      // Team strength
      const fiveSkatersAllowed = doc.playTime < 3600 || gameEvents.data.gameData.game.type === 'P';
      doc.teamStrength = fiveSkatersAllowed ? 5 : 3;
      doc.opposingStrength = fiveSkatersAllowed ? 5 : 3;
      gamePenalties.filter(penalty => doc.playTime >= penalty.startTime && doc.playTime <= penalty.endTime).forEach((penalty) => {
        if (fiveSkatersAllowed && penalty.teamId === doc.teamId && doc.teamStrength > 3) {
          doc.teamStrength -= 1;
        } else if (fiveSkatersAllowed && penalty.teamId !== doc.teamId && doc.opposingStrength > 3) {
          doc.opposingStrength -= 1;
        } else if (!fiveSkatersAllowed && penalty.teamId === doc.teamId && doc.opposingStrength < 5) {
          doc.opposingStrength += 1;
        } else if (!fiveSkatersAllowed && penalty.teamId !== doc.teamId && doc.teamStrength < 5) {
          doc.teamStrength += 1;
        }
      });
      goaliePulls.filter(goaliePull => doc.playTime >= goaliePull.startTime && doc.playTime <= goaliePull.endTime).forEach((goaliePull) => {
        if (goaliePull.teamId === doc.teamId) {
          doc.teamStrength += 1;
        } else {
          doc.opposingStrength += 1;
        }
      });

      // Players on ice
      doc.players = [];
      doc.opposingPlayers = [];
      gameShifts.data.data.forEach((gameShift) => {
        const startTime = timeHelper.getTotalSeconds(gameShift.period, gameShift.startTime, gameEvents.data.gameData.game.type);
        const endTime = timeHelper.getTotalSeconds(gameShift.period, gameShift.endTime, gameEvents.data.gameData.game.type);
        const playTime = doc.playTime;

        if (playTime % 1200 !== 0 && startTime < playTime && playTime <= endTime) {
          if (gameShift.teamId === doc.teamId) {
            doc.players.push(gameShift.playerId);
          } else {
            doc.opposingPlayers.push(gameShift.playerId);
          }
        } else if (playTime % 1200 === 0 && gameShift.period === play.about.period && (startTime === playTime || playTime === endTime)) {
          if (gameShift.teamId === doc.teamId) {
            doc.players.push(gameShift.playerId);
          } else {
            doc.opposingPlayers.push(gameShift.playerId);
          }
        }
      });

      events.push(doc);

      // Break multi-player events into individual events
      if (play.players.length > 1) {
        for (let i = 1; i < play.players.length; i += 1) {
          const newDoc = { ...doc };
          const newPlayer = play.players[i];
          const newPlayerId = newPlayer.player.id;
          newDoc.playerId = newPlayerId;
          newDoc.handedness = gameEvents.data.gameData.players[`ID${newPlayerId}`].shootsCatches;

          // reverse team info in these cases
          if (doc.eventTypeId !== constants.Goal || (doc.eventTypeId === constants.Goal && newPlayer.playerType === constants.GoalieType)) {
            newDoc.teamId = doc.opposingTeamId;
            newDoc.teamStatus = doc.teamStatus === constants.Home ? constants.Away : constants.Home;
            newDoc.teamStrength = doc.opposingStrength;
            newDoc.teamScore = doc.opposingTeamScore;
            newDoc.opposingTeamId = doc.teamId;
            newDoc.opposingStrength = doc.teamStrength;
            newDoc.opposingTeamScore = doc.teamScore;
            newDoc.players = doc.opposingPlayers;
            newDoc.opposingPlayers = doc.players;
          }

          switch (doc.eventTypeId) {
            case constants.Hit:
              newDoc.eventTypeId = constants.Hittee;
              break;
            case constants.BlockedShot:
              newDoc.eventTypeId = constants.ShotBlocked;
              break;
            case constants.Shot:
              newDoc.eventTypeId = constants.Save;
              break;
            case constants.Faceoff:
              newDoc.eventTypeId = constants.FaceoffLoss;
              break;
            case constants.Penalty:
              newDoc.eventTypeId = constants.PenaltyDrawn;
              break;
            case constants.Goal:
              newDoc.eventTypeId = newPlayer.playerType === constants.GoalieType ? constants.GoalAllowed : constants.Assist;
              break;
            default:
              break;
          }

          events.push(newDoc);
        }
      }
    }
  });

  return events;
};
