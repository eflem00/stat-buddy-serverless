const constants = require('../../common/constants');

function parseBoxScore(players, gameData, teamId, teamStatus, opposingTeamId) {
  const events = [];

  Object.keys(players).forEach(key => {
    const player = players[key];
    const playerId = player.person.id;
    const handedness = player.person.shootsCatches;
    const playerStats = player.stats.skaterStats;

    if (playerStats === undefined) {
      return;
    }

    const doc = {
      ...gameData,
      teamId,
      teamStatus,
      playerId,
      handedness,
      opposingTeamId,
      playTime: 0,
    };

    if (player.position.type === constants.GoalieType) {
      // Saves
      for (let i = 0; i < playerStats.powerPlaySaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Save;
        event.opposingStrength = 5;
        event.teamStrength = 4;
        events.push(event);
      }
      for (let i = 0; i < playerStats.shortHandedSaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Save;
        event.opposingStrength = 4;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.evenSaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Save;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }

      // Goals Allowed
      for (let i = 0; i < playerStats.powerPlayShotsAgainst - playerStats.powerPlaySaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.GoalAllowed;
        event.opposingStrength = 5;
        event.teamStrength = 4;
        events.push(event);
      }
      for (let i = 0; i < playerStats.evenShotsAgainst - playerStats.evenSaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.GoalAllowed;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.shortHandedShotsAgainst - playerStats.shortHandedSaves; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.GoalAllowed;
        event.opposingStrength = 4;
        event.teamStrength = 5;
        events.push(event);
      }
    } else {
      // Goals
      for (let i = 0; i < playerStats.goals - playerStats.powerPlayGoals - playerStats.shortHandedGoals; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Goal;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.powerPlayGoals; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Goal;
        event.opposingStrength = 4;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.shortHandedGoals; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Goal;
        event.opposingStrength = 5;
        event.teamStrength = 4;
        events.push(event);
      }
      // Assists
      for (let i = 0; i < playerStats.assists - playerStats.powerPlayAssists - playerStats.shortHandedAssists; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Assist;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.powerPlayAssists; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Assist;
        event.opposingStrength = 4;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.shortHandedAssists; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Assist;
        event.opposingStrength = 5;
        event.teamStrength = 4;
        events.push(event);
      }

      // Others
      for (let i = 0; i < playerStats.shots; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Shot;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.hits; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Hit;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.faceOffWins; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Faceoff;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.faceoffTaken - playerStats.faceOffWins; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.FaceoffLoss;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.takeaways; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Takeaway;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.giveaways; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.Giveaway;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
      for (let i = 0; i < playerStats.blocked; i += 1) {
        const event = { ...doc };
        event.eventTypeId = constants.BlockedShot;
        event.opposingStrength = 5;
        event.teamStrength = 5;
        events.push(event);
      }
    }
  });
  return events;
}

module.exports = function constructLivePlays(gamePk, gameEvents) {
  const gameData = {
    gamePk,
    dateTime: gameEvents.data.gameData.datetime.dateTime,
  };

  let teamId = gameEvents.data.liveData.boxscore.teams.away.team.id;
  let opposingTeamId = gameEvents.data.liveData.boxscore.teams.home.team.id;
  let teamStatus = constants.Away;
  let players = gameEvents.data.liveData.boxscore.teams.away.players;
  const awayEvents = parseBoxScore(players, gameData, teamId, teamStatus, opposingTeamId);

  teamId = gameEvents.data.liveData.boxscore.teams.home.team.id;
  opposingTeamId = gameEvents.data.liveData.boxscore.teams.away.team.id;
  teamStatus = constants.Home;
  players = gameEvents.data.liveData.boxscore.teams.home.players;
  const homeEvents = parseBoxScore(players, gameData, teamId, teamStatus, opposingTeamId);

  return [...awayEvents, ...homeEvents];
};
