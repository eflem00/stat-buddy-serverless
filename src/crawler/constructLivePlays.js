const constants = require('./constants');

function parseBoxScore(players, gameData, teamId, teamStatus) {
  const events = [];

  Object.keys(players).forEach((key) => {
    const player = players[key];
    const playerId = player.person.id;
    const handedness = player.person.shootsCatches;
    const playerStats = player.stats.skaterStats;
    if (playerStats === undefined) {
      return;
    }
    if (player.position.type === constants.GoalieType) {
      // Saves
      for (let i = 0; i < playerStats.powerPlaySaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Save;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 1;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shortHandedSaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Save;
        doc.penaltiesAgainst = 1;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.evenSaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Save;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }

      // Goals Allowed
      for (let i = 0; i < playerStats.powerPlayShotsAgainst - playerStats.powerPlaySaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.GoalAllowed;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 1;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.evenShotsAgainst - playerStats.evenSaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.GoalAllowed;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shortHandedShotsAgainst - playerStats.shortHandedSaves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.GoalAllowed;
        doc.penaltiesAgainst = 1;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
    } else {
      // Goals
      for (let i = 0; i < playerStats.goals - playerStats.powerPlayGoals - playerStats.shortHandedGoals; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Goal;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.powerPlayGoals; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Goal;
        doc.penaltiesAgainst = 1;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shortHandedGoals; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Goal;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 1;
        events.push(doc);
      }
      // Assists
      for (let i = 0; i < playerStats.assists - playerStats.powerPlayAssists - playerStats.shortHandedAssists; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Assist;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.powerPlayAssists; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Assist;
        doc.penaltiesAgainst = 1;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shortHandedAssists; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Assist;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 1;
        events.push(doc);
      }

      // Others
      for (let i = 0; i < playerStats.shots; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Shot;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.hits; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Hit;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.faceOffWins; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Faceoff;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.faceoffTaken - playerStats.faceOffWins; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.FaceoffLoss;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.takeaways; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Takeaway;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.giveaways; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Giveaway;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.blocked; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.BlockedShot;
        doc.penaltiesAgainst = 0;
        doc.penaltiesFor = 0;
        events.push(doc);
      }
    }
  });

  return events;
}

module.exports = function constructLivePlays(gamePk, gameEvents) {
  const gameData = {
    gamePk,
    gameType: gameEvents.data.gameData.game.type,
    gameSeason: parseInt(gameEvents.data.gameData.game.season, 10),
    venue: gameEvents.data.gameData.venue.name,
    dateTime: gameEvents.data.gameData.datetime.dateTime,
  };

  let teamId = gameEvents.data.liveData.boxscore.teams.away.team.id;
  let teamStatus = 'AWAY';
  let players = gameEvents.data.liveData.boxscore.teams.away.players;
  const awayEvents = parseBoxScore(players, gameData, teamId, teamStatus);

  teamId = gameEvents.data.liveData.boxscore.teams.home.team.id;
  teamStatus = 'HOME';
  players = gameEvents.data.liveData.boxscore.teams.home.players;
  const homeEvents = parseBoxScore(players, gameData, teamId, teamStatus);

  return [...awayEvents, ...homeEvents];
};
