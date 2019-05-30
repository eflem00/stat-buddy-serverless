const parseLivePlays = require('../parseLivePlays');

let gamePk;
let gameEvents;
let gameShifts;

describe('Test the parseLivePlays Method', () => {
  beforeEach(() => {
    gamePk = 'abc123';
    awayTeamId = '111';
    homeTeamId = '222';
    gameEvents = {
      data: {
        gameData: {
          game: {
            type: 'R',
            season: '20172018',
          },
          datetime: {
            dateTime: '2018-01-01',
          },
          venue: {
            name: 'kappa arena',
          },
          teams: {
            away: {
              id: awayTeamId
            },
            home: {
              id: homeTeamId
            },
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
    };
    const about = {
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      dateTime: '2018-01-01T18:46:36.233Z',
    };
    const team = {
      id: awayTeamId
    }
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.game_pk).toEqual(gamePk);
    expect(doc.game_type).toEqual(gameData.game.type);
    expect(doc.game_season).toEqual(gameData.game.season);
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.event_type_id).toEqual(result.eventTypeId);
    expect(doc.game_winning_goal).toEqual(undefined);
    expect(doc.strength).toEqual(undefined);
    expect(doc.period).toEqual(about.period);
    expect(doc.period_type).toEqual(about.periodType);
    expect(doc.period_time).toEqual(about.periodTime);
    expect(doc.date_time).toEqual(about.dateTime);
    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);

    expect(doc.team_id).toEqual(awayTeamId);
    expect(doc.team_status).toEqual('AWAY');
  });

  test.each(['HOME'], ['AWAY'])('Should team status', (status) => {
    const gameData = gameEvents.data.gameData;
    const teamId = status === 'HOME' ? homeTeamId : awayTeamId;
    const result = {
      eventTypeId: 'SHOT',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN'
      },
      secondaryType: 'Wrist Shot',
    };
    const about = {
      period: 2,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      dateTime: '2018-01-01T18:46:36.233Z',
    };
    const team = {
      id: teamId,
    }
    const x = 10;
    const y = -3
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team,
      coordinates: {
        x,
        y,
      },
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.game_pk).toEqual(gamePk);
    expect(doc.game_type).toEqual(gameData.game.type);
    expect(doc.game_season).toEqual(gameData.game.season);
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.event_type_id).toEqual(result.eventTypeId);
    expect(doc.game_winning_goal).toEqual(true);
    expect(doc.strength).toEqual('EVEN');
    expect(doc.secondary_type).toEqual('Wrist Shot');
    expect(doc.period).toEqual(about.period);
    expect(doc.period_type).toEqual(about.periodType);
    expect(doc.period_time).toEqual(about.periodTime);
    expect(doc.date_time).toEqual(about.dateTime);
    expect(doc.x).toEqual(x);
    expect(doc.y).toEqual(y);

    expect(doc.team_id).toEqual(teamId);
    expect(doc.team_status).toEqual(status);
  });

  test.each(
    ['HOME', 'HIT', 'HITTEE', 'AWAY'],
    ['HOME', 'BLOCKED_SHOT', 'SHOT_BLOCKED', 'AWAY'],
    ['HOME', 'SHOT', 'SAVE', 'AWAY'],
    ['HOME', 'FACEOFF', 'FACEOFF_LOSS', 'AWAY'],
    ['HOME', 'GOAL', 'GOAL_ALLOWED', 'AWAY'],
    ['HOME', 'GOAL', 'ASSIST', 'HOME'],
    ['AWAY', 'HIT', 'HITTEE', 'AWAY'],
    ['AWAY', 'BLOCKED_SHOT', 'SHOT_BLOCKED', 'AWAY'],
    ['AWAY', 'SHOT', 'SAVE', 'AWAY'],
    ['AWAY', 'FACEOFF', 'FACEOFF_LOSS', 'AWAY'],
    ['AWAY', 'GOAL', 'GOAL_ALLOWED', 'AWAY'],
    ['AWAY', 'GOAL', 'ASSIST', 'AWAY'],
  )('Should handle play with player data', (teamStatus, eventTypeId, secondEventTypeId, secondTeamStatus) => {
    const player1 = 666;
    const player2 = 555;
    const players = {};
    const teamId = teamStatus === 'HOME' ? homeTeamId : awayTeamId;
    const secondTeamId = secondTeamStatus === 'HOME' ? awayTeamId : homeTeamId;
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    players[`ID${player2}`] = {
      shootsCatches: 'R',
    };
    gameEvents.data.gameData.players = players;

    const result = {
      eventTypeId,
    };
    const about = {
      period: 2,
      periodType: 'regular',
      periodTime: '02:36',
      dateTime: '2018-01-01T18:46:36.233Z',
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      coordinates: {},
      team: {
        id: teamId,
      },
      players: [
        {
          player: {
            id: player1,
          },
        },
        {
          player: {
            id: player2,
          },
        },
      ],
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    expect(events.length).toEqual(2);

    let doc = events[0];
    expect(doc.player_id).toEqual(player1);
    expect(doc.handedness).toEqual('L');
    expect(doc.team_id).toEqual(teamId);
    expect(doc.team_status).toEqual(teamStatus);
    expect(doc.event_type_id).toEqual(eventTypeId);

    doc = events[1];
    expect(doc.player_id).toEqual(player2);
    expect(doc.handedness).toEqual('R');
    expect(doc.team_id).toEqual(secondTeamId);
    expect(doc.team_status).toEqual(secondTeamStatus);
    expect(doc.event_type_id).toEqual(secondEventTypeId);
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
