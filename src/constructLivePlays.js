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
      for (let i = 0; i < playerStats.saves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Save;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shots - playerStats.saves; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.GoalAllowed;
        events.push(doc);
      }
    } else {
      for (let i = 0; i < playerStats.assists; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Assist;
        events.push(doc);
      }
      for (let i = 0; i < playerStats.goals; i += 1) {
        const doc = {
          ...gameData,
          teamId,
          teamStatus,
          playerId,
        };
        doc.playerId = playerId;
        doc.handedness = handedness;
        doc.eventTypeId = constants.Goal;
        events.push(doc);
      }
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
    gameSeason: gameEvents.data.gameData.game.season,
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
