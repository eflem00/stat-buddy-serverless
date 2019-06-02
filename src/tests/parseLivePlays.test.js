const parseLivePlays = require('../parseLivePlays');

let gamePk;
let gameEvents;
let gameShifts;
let gamePenalties;
let awayTeamId;
let homeTeamId;

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
              id: awayTeamId,
            },
            home: {
              id: homeTeamId,
            },
          },
          players: {
            'ID1': {
              shootsCatches: 'L',
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
    gamePenalties = [];
  });

  test.each([[undefined], [[]]])('Should return succesfully with empty plays', (players) => {
    gameEvents.data.liveData.plays.allPlays.push({ players });
    expect(() => parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties)).not.toThrow();
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
      id: awayTeamId,
    };
    const players = [{
      player: {
        id: '1',
      },
    }];
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team,
      players,
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.game_pk).toEqual(gamePk);
    expect(doc.game_type).toEqual(gameData.game.type);
    expect(doc.game_season).toEqual(gameData.game.season);
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.event_type_id).toEqual(result.eventTypeId);
    expect(doc.game_winning_goal).toEqual(undefined);
    expect(doc.strength).toEqual(undefined);
    expect(doc.penalty_severity).toEqual(undefined);
    expect(doc.penalty_minutes).toEqual(undefined);
    expect(doc.play_time).toEqual(1356);
    expect(doc.date_time).toEqual(about.dateTime);
    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);

    expect(doc.team_id).toEqual(awayTeamId);
    expect(doc.team_status).toEqual('AWAY');
  });

  test.each([['HOME'], ['AWAY']])('Should check team status', (status) => {
    const gameData = gameEvents.data.gameData;
    const teamId = status === 'HOME' ? homeTeamId : awayTeamId;
    const result = {
      eventTypeId: 'SHOT',
      gameWinningGoal: true,
      strength: {
        code: 'EVEN',
      },
      secondaryType: 'Wrist Shot',
      penaltySeverity: 'Major',
      penaltyMinutes: 4,
    };
    const about = {
      period: 1,
      periodType: 'regular',
      ordinalNum: 'second',
      periodTime: '02:36',
      dateTime: '2018-01-01T18:46:36.233Z',
    };
    const team = {
      id: teamId,
    };
    const x = 10;
    const y = -3;
    const players = [{
      player: {
        id: '1',
      },
    }];
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      team,
      coordinates: {
        x,
        y,
      },
      players,
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.game_pk).toEqual(gamePk);
    expect(doc.game_type).toEqual(gameData.game.type);
    expect(doc.game_season).toEqual(gameData.game.season);
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.event_type_id).toEqual(result.eventTypeId);
    expect(doc.game_winning_goal).toEqual(true);
    expect(doc.strength).toEqual('EVEN');
    expect(doc.penalty_severity).toEqual('Major');
    expect(doc.penalty_minutes).toEqual(4);
    expect(doc.secondary_type).toEqual('Wrist Shot');
    expect(doc.play_time).toEqual(156);
    expect(doc.date_time).toEqual(about.dateTime);
    expect(doc.x).toEqual(x);
    expect(doc.y).toEqual(y);

    expect(doc.team_id).toEqual(teamId);
    expect(doc.team_status).toEqual(status);
  });

  test.each([
    ['HOME', 'HIT', 'HITTEE', 'AWAY', 'Forward'],
    ['HOME', 'BLOCKED_SHOT', 'SHOT_BLOCKED', 'AWAY', 'Forward'],
    ['HOME', 'SHOT', 'SAVE', 'AWAY', 'Forward'],
    ['HOME', 'FACEOFF', 'FACEOFF_LOSS', 'AWAY', 'Forward'],
    ['HOME', 'PENALTY', 'PENALTY_DRAWN', 'AWAY', 'Forward'],
    ['HOME', 'GOAL', 'ASSIST', 'HOME', 'Forward'],
    ['HOME', 'GOAL', 'GOAL_ALLOWED', 'AWAY', 'Goalie'],
    ['AWAY', 'HIT', 'HITTEE', 'HOME', 'Forward'],
    ['AWAY', 'BLOCKED_SHOT', 'SHOT_BLOCKED', 'HOME', 'Forward'],
    ['AWAY', 'SHOT', 'SAVE', 'HOME', 'Forward'],
    ['AWAY', 'FACEOFF', 'FACEOFF_LOSS', 'HOME', 'Forward'],
    ['AWAY', 'PENALTY', 'PENALTY_DRAWN', 'HOME', 'Forward'],
    ['AWAY', 'GOAL', 'ASSIST', 'AWAY', 'Forward'],
    ['AWAY', 'GOAL', 'GOAL_ALLOWED', 'HOME', 'Goalie'],
  ])('Should handle play with player data', (teamStatus, eventTypeId, secondEventTypeId, secondTeamStatus, secondaryPlayerType) => {
    const player1 = 666;
    const player2 = 555;
    const teamId = teamStatus === 'HOME' ? homeTeamId : awayTeamId;
    const secondTeamId = secondTeamStatus === 'HOME' ? homeTeamId : awayTeamId;

    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    players[`ID${player2}`] = {
      shootsCatches: 'R',
    };
    gameEvents.data.gameData.players = players;

    gameEvents.data.liveData.plays.allPlays = [{
      result: {
        eventTypeId,
      },
      about: {
        period: 2,
        periodType: 'regular',
        periodTime: '02:36',
        dateTime: '2018-01-01T18:46:36.233Z',
      },
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
          playerType: secondaryPlayerType,
        },
      ],
    }];

    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);

    expect(events.length).toEqual(2);

    let doc = events[0];
    expect(doc.player_id).toEqual(player2);
    expect(doc.handedness).toEqual('R');
    expect(doc.team_id).toEqual(secondTeamId);
    expect(doc.team_status).toEqual(secondTeamStatus);
    expect(doc.event_type_id).toEqual(secondEventTypeId);

    doc = events[1];
    expect(doc.player_id).toEqual(player1);
    expect(doc.handedness).toEqual('L');
    expect(doc.team_id).toEqual(teamId);
    expect(doc.team_status).toEqual(teamStatus);
    expect(doc.event_type_id).toEqual(eventTypeId);
  });

  test('Should find players that were on the ice', () => {
    const player1 = 666;
    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    gameEvents.data.gameData.players = players;

    gameEvents.data.liveData.plays.allPlays = [{
      result: {
        eventTypeId: 'kappa',
      },
      about: {
        period: 2,
        periodType: 'regular',
        periodTime: '02:36',
        dateTime: '2018-01-01T18:46:36.233Z',
      },
      players: [{
        player: {
          id: player1,
        },
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
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.players.length).toEqual(2);

    let playerId = doc.players[0];
    expect(playerId).toEqual(player1);

    playerId = doc.players[1];
    expect(playerId).toEqual(newPlayer1);
  });

  test('Should include players for game start', () => {
    const player1 = 666;
    const notInPlayerId1 = 666;
    const newPlayer1 = 1337;
    const players = {};
    players[`ID${player1}`] = {
      shootsCatches: 'L',
    };
    players[`ID${newPlayer1}`] = {
      shootsCatches: 'L',
    };
    gameEvents.data.gameData.players = players;

    gameEvents.data.liveData.plays.allPlays = [{
      result: {
        eventTypeId: 'kappa',
      },
      about: {
        period: 1,
        periodType: 'regular',
        periodTime: '00:00',
        dateTime: '2018-01-01T18:46:36.233Z',
      },
      players: [{
        player: {
          id: player1,
        },
      }],
    },
    {
      result: {
        eventTypeId: 'kappa2',
      },
      about: {
        period: 1,
        periodType: 'regular',
        periodTime: '20:00',
        dateTime: '2018-01-01T18:46:36.233Z',
      },
      players: [{
        player: {
          id: newPlayer1,
        },
      }],
    }];

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
      {
        startTime: '18:55',
        endTime: '20:00',
        playerId: newPlayer1,
        period: 1,
      },
    ];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
    expect(events.length).toEqual(2);

    let doc = events[0];
    expect(doc.players.length).toEqual(2);
    expect(doc.players[0]).toEqual(player1);
    expect(doc.players[1]).toEqual(newPlayer1);

    doc = events[1];
    expect(doc.players.length).toEqual(1);
    expect(doc.players[0]).toEqual(newPlayer1);
  });

  test('Should determine strength of play', () => {
    gameEvents.data.liveData.plays.allPlays = [
      {
        result: {
          eventTypeId: 'in1',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '02:30',
        },
        team: {
          id: 2,
        },
        players: [{
          player: {
            id: 1,
          },
        }],
      },
      {
        result: {
          eventTypeId: 'in2',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '04:30',
        },
        team: {
          id: 1,
        },
        players: [{
          player: {
            id: 1,
          },
        }],
      },
      {
        result: {
          eventTypeId: 'notin1',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '02:29',
        },
        team: {
          id: 2,
        },
        players: [{
          player: {
            id: 1,
          },
        }],
      },
      {
        result: {
          eventTypeId: 'notin2',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '04:31',
        },
        team: {
          id: 2,
        },
        players: [{
          player: {
            id: 1,
          },
        }],
      },
    ];

    gamePenalties = [
      {
        startTime: 150,
        endTime: 270,
        teamId: 2,
      },
      {
        startTime: 45,
        endTime: 165,
        teamId: 1,
      },
    ];

    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
    expect(events.length).toEqual(4);

    let event = events.filter(x => x.event_type_id === 'in1')[0];
    expect(event.penalties_for).toEqual(1);
    expect(event.penalties_against).toEqual(1);

    event = events.filter(x => x.event_type_id === 'in2')[0];
    expect(event.penalties_for).toEqual(0);
    expect(event.penalties_against).toEqual(1);

    event = events.filter(x => x.event_type_id === 'notin1')[0];
    expect(event.penalties_for).toEqual(0);
    expect(event.penalties_against).toEqual(1);

    event = events.filter(x => x.event_type_id === 'notin2')[0];
    expect(event.penalties_for).toEqual(0);
    expect(event.penalties_against).toEqual(0);
  });
});
