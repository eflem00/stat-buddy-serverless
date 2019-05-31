function parseBoxScore(players, gameData, team_id, team_status) {
  const events = [];

  Object.keys(players).forEach((key) => {
    const player = players[key];
    const player_id = player.person.id;
    const handedness = player.person.shootsCatches;
    const playerStats = player.stats.skaterStats;
    if (playerStats === undefined) {
      return;
    }
    if (player.position.code === 'G') {
      for (let i = 0; i < playerStats.saves; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'SAVE';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shots - playerStats.saves; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'GOAL_ALLOWED';
        events.push(doc);
      }
    } else {
      for (let i = 0; i < playerStats.assists; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'ASSIST';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.goals; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'GOAL';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.shots; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'SHOT';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.hits; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'HIT';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.faceOffWins; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'FACEOFF';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.faceoffTaken - playerStats.faceOffWins; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'FACEOFF_LOSS';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.takeaways; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'TAKEAWAY';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.giveaways; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'GIVEAWAY';
        events.push(doc);
      }
      for (let i = 0; i < playerStats.blocked; i += 1) {
        const doc = {
          ...gameData,
          team_id,
          team_status,
          player_id,
        };
        doc.player_id = player_id;
        doc.handedness = handedness;
        doc.event_type_id = 'BLOCKED_SHOT';
        events.push(doc);
      }
    }
  });

  return events;
}

module.exports = function constructLivePlays(gamePk, gameEvents) {
  const gameData = {
    game_pk: gamePk,
    game_type: gameEvents.data.gameData.game.type,
    game_season: gameEvents.data.gameData.game.season,
    venue: gameEvents.data.gameData.venue.name,
    date_time: gameEvents.data.gameData.datetime.dateTime,
  };

  let team_id = gameEvents.data.liveData.boxscore.teams.away.team.id;
  let team_status = 'AWAY';
  let players = gameEvents.data.liveData.boxscore.teams.away.players;
  const awayEvents = parseBoxScore(players, gameData, team_id, team_status);

  team_id = gameEvents.data.liveData.boxscore.teams.home.team.id;
  team_status = 'HOME';
  players = gameEvents.data.liveData.boxscore.teams.home.players;
  const homeEvents = parseBoxScore(players, gameData, team_id, team_status);

  return [...awayEvents, ...homeEvents];
};
