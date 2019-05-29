const parseLivePlays = require('../parseLivePlays');

let gamePk;
let gameEvents;
let gameShifts;

describe('Test the parseLivePlays Method', () => {
  beforeEach(() => {
    gamePk = 'abc123';
    gameEvents = {
      data: {
        gameData: {
          game: {
            type: 'R',
            season: '20172018',
          },
          datetime: {
            dateTime: '2018-01-01',
            endDateTime: '2018-01-01',
          },
          venue: {
            name: 'kappa arena',
          },
        },
        liveData: {
          plays: {
            allPlays: [],
          },
        },
      },
    };
    gameShifts = {
      data: {
        data: [],
      },
    };
  });

  test('Should return succesfully with empty plays', () => {
    expect(() => parseLivePlays(gamePk, gameEvents, gameShifts)).not.toThrow();
  });

  test('Should handle play with undefined data', () => {
    const gameData = gameEvents.data.gameData;
    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());
    expect(doc.game_pk).toEqual(gamePk);
    expect(doc.game_type).toEqual(gameData.game.type);
    expect(doc.game_season).toEqual(gameData.game.season);
    expect(doc.venue).toEqual(gameData.venue.name);

    expect(doc.event_type_id).toEqual(result.eventTypeId);
    expect(doc.event_code).toEqual(result.eventCode);
    expect(doc.event).toEqual(result.event);
    expect(doc.game_winning_goal).toEqual(undefined);
    expect(doc.strength).toEqual(undefined);

    expect(doc.event_idx).toEqual(about.eventIdx);
    expect(doc.event_id).toEqual(about.eventId);
    expect(doc.period).toEqual(about.period);
    expect(doc.period_type).toEqual(about.periodType);
    expect(doc.ordinal_num).toEqual(about.ordinalNum);
    expect(doc.period_time).toEqual(about.periodTime);
    expect(doc.period_time_remaining).toEqual(about.periodTimeRemaining);
    expect(doc.date_time).toEqual(about.dateTime);

    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);

    expect(doc.teams).toEqual([]);
    expect(doc.players).toEqual([]);
  });

  test('Should handle play with team data when primary team is away', () => {
    const id = 666;
    const otherId = 555;
    gameEvents.data.gameData.teams = {
      away: {
        id,
      },
      home: {
        id: otherId,
      },
    };

    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
      goals: {
        home: 5,
        away: 6,
      },
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team: {
        id,
      },
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());
    expect(doc.game_winning_goal).toEqual(result.gameWinningGoal);
    expect(doc.strength).toEqual(result.strength.code);

    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);

    expect(doc.teams.length).toEqual(2);

    const team = doc.teams[0];
    expect(team.id).toEqual(id);
    expect(team.status).toEqual('Away');
    expect(team.type).toEqual('Primary');
    expect(team.goals).toEqual(6);

    const otherTeam = doc.teams[1];
    expect(otherTeam.id).toEqual(otherId);
    expect(otherTeam.status).toEqual('Home');
    expect(otherTeam.type).toEqual('Secondary');
    expect(otherTeam.goals).toEqual(5);

    expect(doc.players).toEqual([]);
  });

  test('Should handle play with team data when primary team is home', () => {
    const id = 666;
    const otherId = 555;
    gameEvents.data.gameData.teams = {
      away: {
        id: otherId,
      },
      home: {
        id,
      },
    };

    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
      goals: {
        home: 5,
        away: 6,
      },
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team: {
        id,
      },
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());
    expect(doc.game_winning_goal).toEqual(result.gameWinningGoal);
    expect(doc.strength).toEqual(result.strength.code);

    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);

    expect(doc.teams.length).toEqual(2);

    const team = doc.teams[0];
    expect(team.id).toEqual(id);
    expect(team.status).toEqual('Home');
    expect(team.type).toEqual('Primary');
    expect(team.goals).toEqual(5);

    const otherTeam = doc.teams[1];
    expect(otherTeam.id).toEqual(otherId);
    expect(otherTeam.status).toEqual('Away');
    expect(otherTeam.type).toEqual('Secondary');
    expect(otherTeam.goals).toEqual(6);

    expect(doc.players).toEqual([]);
  });

  test('Should handle play with player data', () => {
    const player1 = 666;
    const player2 = 555;
    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    players[`ID${player2}`] = {
      shootsCatches: 'R',
    };
    gameEvents.data.gameData.players = players;

    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
      goals: {
        home: 5,
        away: 6,
      },
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      coordinates: {
        x: 12,
        y: -5,
      },
      players: [
        {
          player: {
            id: player1,
          },
          playerType: 'Forward',
        },
        {
          player: {
            id: player2,
          },
          playerType: 'Goalie',
        },
      ],
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());

    expect(doc.x).toEqual(12);
    expect(doc.y).toEqual(-5);

    expect(doc.players.length).toEqual(2);

    let player = doc.players[0];
    expect(player.id).toEqual(player1);
    expect(player.type).toEqual('Forward');
    expect(player.handedness).toEqual('L');

    player = doc.players[1];
    expect(player.id).toEqual(player2);
    expect(player.type).toEqual('Goalie');
    expect(player.handedness).toEqual('R');

    expect(doc.teams).toEqual([]);
  });

  test('Should find players that were on the ice', () => {
    const player1 = 666;
    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    gameEvents.data.gameData.players = players;

    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
      goals: {
        home: 5,
        away: 6,
      },
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      players: [{
        player: {
          id: player1,
        },
        playerType: 'Forward',
      }],
    }];

    const notInPlayerId1 = 666;
    const notInPlayerId2 = 666666;
    const notInPlayerId3 = 777;
    const notInPlayerId4 = 888;
    const alreadyInPlayerId = player1;
    const newPlayer1 = 1337;
    gameShifts.data.data = [
      {
        startTime: '03:30',
        endTime: '03:45',
        playerId: notInPlayerId1,
        period: 2,
      },
      {
        startTime: '02:36',
        endTime: '03:45',
        playerId: notInPlayerId2,
        period: 2,
      },
      {
        startTime: '02:15',
        endTime: '03:45',
        playerId: notInPlayerId3,
        period: 4,
      },
      {
        startTime: '02:15',
        endTime: '02:20',
        playerId: notInPlayerId4,
        period: 2,
      },
      {
        startTime: '02:20',
        endTime: '03:45',
        playerId: alreadyInPlayerId,
        period: 2,
      },
      {
        startTime: '02:35',
        endTime: '02:36',
        playerId: newPlayer1,
        period: 2,
      },
    ];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());

    expect(doc.players.length).toEqual(2);

    let player = doc.players[0];
    expect(player.id).toEqual(player1);
    expect(player.type).toEqual('Forward');
    expect(player.handedness).toEqual('L');

    player = doc.players[1];
    expect(player.id).toEqual(newPlayer1);
    expect(player.type).toEqual('OnIce');
  });

  test('Should include players for game start', () => {
    const player1 = 666;
    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    gameEvents.data.gameData.players = players;

    const result = {
      eventTypeId: 'kappa',
      eventCode: 'code kappa',
      event: 'also kappa',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
    };
    const about = {
      eventIdx: 123,
      eventId: 1,
      period: 1,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '00:00',
      periodTimeRemaining: '18:24',
      dateTime: '2018-01-01T18:46:36.233Z',
      goals: {
        home: 5,
        away: 6,
      },
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      players: [{
        player: {
          id: player1,
        },
        playerType: 'Forward',
      }],
    }];

    const notInPlayerId1 = 666;
    const newPlayer1 = 1337;
    gameShifts.data.data = [
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: notInPlayerId1,
        period: 2,
      },
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: player1,
        period: 1,
      },
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: newPlayer1,
        period: 1,
      },
    ];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.id).toEqual(gamePk.toString() + about.eventIdx.toString());

    expect(doc.players.length).toEqual(2);

    let player = doc.players[0];
    expect(player.id).toEqual(player1);
    expect(player.type).toEqual('Forward');
    expect(player.handedness).toEqual('L');

    player = doc.players[1];
    expect(player.id).toEqual(newPlayer1);
    expect(player.type).toEqual('OnIce');
  });
});
