function countToArray(count, playerId, handedness) {
  const arr = [];
  let i = count;
  while (i > 0) {
    arr.push({
      playerId,
      handedness,
    });
    i -= 1;
  }
  return arr;
}

function countBoxScores(players, teamId) {
  const totals = {
    teamId,
    goalieId: undefined,
    goals: [],
    assists: [],
    shots: [],
    blocks: [],
    hits: [],
    faceOffWins: [],
    faceoffLosses: [],
    takeaways: [],
    giveaways: [],
  };

  Object.keys(players).forEach((key) => {
    const player = players[key];
    const playerId = player.person.id;
    const handedness = player.person.shootsCatches;
    const playerStats = player.stats.skaterStats;

    if (playerStats === undefined) {
      return;
    }

    if (player.position.name === 'Goalie') {
      totals.goalieId = player.person.id;
    }

    const goals = countToArray(playerStats.goals, playerId, handedness);
    totals.goals = [...totals.goals, ...goals];

    const assists = countToArray(playerStats.assists, playerId, handedness);
    totals.assists = [...totals.assists, ...assists];

    const shots = countToArray(playerStats.shots, playerId, handedness);
    totals.shots = [...totals.shots, ...shots];

    const blocks = countToArray(playerStats.blocked, playerId, handedness);
    totals.blocks = [...totals.blocks, ...blocks];

    const hits = countToArray(playerStats.hits, playerId, handedness);
    totals.hits = [...totals.hits, ...hits];

    const faceOffWins = countToArray(playerStats.faceOffWins, playerId, handedness);
    totals.faceOffWins = [...totals.faceOffWins, ...faceOffWins];

    const faceoffLosses = countToArray(playerStats.faceoffTaken - playerStats.faceOffWins, playerId, handedness);
    totals.faceoffLosses = [...totals.faceoffLosses, ...faceoffLosses];

    const takeaways = countToArray(playerStats.takeaways, playerId, handedness);
    totals.takeaways = [...totals.takeaways, ...takeaways];

    const giveaways = countToArray(playerStats.giveaways, playerId, handedness);
    totals.giveaways = [...totals.giveaways, ...giveaways];
  });

  return totals;
}

function constructDocs(totals, opponentTotals, teams, gameData, i) {
  const events = [];

  let eventIdx = i;
  while (totals.goals.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'GOAL';
    doc.event = 'Goal';

    doc.players = [];
    const goal = totals.goals.pop();
    doc.players.push({
      id: goal.playerId,
      handedness: goal.handedness,
      type: 'Scorer',
    });
    if (totals.assists > 0) {
      const assist = totals.assists.pop();
      doc.players.push({
        id: assist.playerId,
        handedness: assist.handedness,
        type: 'Assist',
      });
    }
    if (totals.assists > 0) {
      const assist = totals.assists.pop();
      doc.players.push({
        id: assist.playerId,
        handedness: assist.handedness,
        type: 'Assist',
      });
    }
    if (opponentTotals.goalieId !== undefined) {
      doc.players.push({
        id: opponentTotals.goalieId,
        type: 'Goalie',
      });
    }

    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
    eventIdx += 1;
  }

  // Shots
  while (totals.shots.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'SHOT';
    doc.event = 'Shot';

    doc.players = [];
    const shot = totals.shots.pop();
    doc.players.push({
      id: shot.playerId,
      handedness: shot.handedness,
      type: 'Shooter',
    });
    if (opponentTotals.blocks > 0) {
      const block = opponentTotals.blocks.pop();
      doc.players.push({
        id: block.playerId,
        handedness: block.handedness,
        type: 'Blocker',
      });
    }

    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
    eventIdx += 1;
  }

  // Hits
  while (totals.hits.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'HIT';
    doc.event = 'Hit';
    doc.players = [];
    const shot = totals.hits.pop();
    doc.players.push({
      id: shot.playerId,
      handedness: shot.handedness,
      type: 'Hitter',
    });
    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
  }

  // Faceoff wins
  while (totals.faceOffWins.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'FACEOFF';
    doc.event = 'Faceoff';

    doc.players = [];
    const winner = totals.faceOffWins.pop();
    doc.players.push({
      id: winner.playerId,
      handedness: winner.handedness,
      type: 'Winner',
    });
    if (opponentTotals.faceoffLosses > 0) {
      const loser = opponentTotals.faceoffLosses.pop();
      doc.players.push({
        id: loser.playerId,
        handedness: loser.handedness,
        type: 'Loser',
      });
    }

    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
    eventIdx += 1;
  }

  // Takeaways
  while (totals.takeaways.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'TAKEAWAY';
    doc.event = 'Takeaway';

    doc.players = [];
    const player = totals.takeaways.pop();
    doc.players.push({
      id: player.playerId,
      handedness: player.handedness,
      type: 'PlayerID',
    });

    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
    eventIdx += 1;
  }

  // Giveaways
  while (totals.giveaways.length > 0) {
    const doc = { ...gameData };
    doc.event_idx = eventIdx;
    doc.event_type_id = 'GIVEAWAY';
    doc.event = 'Giveaway';

    doc.players = [];
    const player = totals.giveaways.pop();
    doc.players.push({
      id: player.playerId,
      handedness: player.handedness,
      type: 'PlayerID',
    });

    doc.teams = teams;

    doc.id = doc.game_pk.toString() + doc.event_idx.toString();
    events.push(doc);
    eventIdx += 1;
  }

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

  // Away Team
  const awayTeamTotals = countBoxScores(gameEvents.data.liveData.boxscore.teams.away.players, gameEvents.data.gameData.teams.away.id);
  const awayTeams = [{
    id: gameEvents.data.gameData.teams.away.id,
    status: 'Away',
    type: 'Primary',
    goals: 0,
  },
  {
    id: gameEvents.data.gameData.teams.home.id,
    status: 'Home',
    type: 'Secondary',
    goals: 0,
  }];

  // Home Team
  const homeTeamTotals = countBoxScores(gameEvents.data.liveData.boxscore.teams.home.players, gameEvents.data.gameData.teams.home.id);
  const homeTeams = [{
    id: gameEvents.data.gameData.teams.home.id,
    status: 'Home',
    type: 'Primary',
    goals: 0,
  },
  {
    id: gameEvents.data.gameData.teams.away.id,
    status: 'Away',
    type: 'Secondary',
    goals: 0,
  },
  ];

  let eventIdx = 0;
  const awayEvents = constructDocs(awayTeamTotals, homeTeamTotals, awayTeams, gameData, eventIdx);
  eventIdx = awayEvents.length;
  const homeEvents = constructDocs(homeTeamTotals, awayTeamTotals, homeTeams, gameData, eventIdx);

  return [...awayEvents, ...homeEvents];
};
