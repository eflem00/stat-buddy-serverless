const parseLivePlays = require('../parseLivePlays');
const constants = require('../constants');

let gamePk;
let gameEvents;
let gameShifts;
let gamePenalties;
let goaliePulls;
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
    goaliePulls = [];
  });

  test.each([[undefined], [[]]])('Should return succesfully with empty plays', (players) => {
    gameEvents.data.liveData.plays.allPlays.push({ players });
    expect(() => parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls)).not.toThrow();
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
      goals: {
        away: 0,
        home: 0,
      },
    };
    const players = [{
      player: {
        id: '1',
      },
    }];
    const team = {
      id: awayTeamId,
    };
    gameEvents.data.liveData.plays.allPlays = [{
      result,
      about,
      players,
      team,
    }];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.gamePk).toEqual(gamePk);
    expect(doc.gameType).toEqual(gameData.game.type);
    expect(doc.gameSeason).toEqual(parseInt(gameData.game.season, 10));
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.eventTypeId).toEqual(result.eventTypeId);
    expect(doc.gameWinningGoal).toEqual(undefined);
    expect(doc.emptyNet).toEqual(undefined);
    expect(doc.penaltySeverity).toEqual(undefined);
    expect(doc.penaltyMinutes).toEqual(undefined);
    expect(doc.secondaryType).toEqual(undefined);
    expect(doc.playTime).toEqual(1356);
    expect(doc._id.dateTime).toBeDefined();
    expect(doc.x).toEqual(undefined);
    expect(doc.y).toEqual(undefined);
    expect(doc.teamId).toEqual(team.id);
    expect(doc.teamStatus).toEqual(constants.Away);
  });

  test.each([[constants.Home], [constants.Away]])('Should check team status', (status) => {
    const gameData = gameEvents.data.gameData;
    const teamId = status === constants.Home ? homeTeamId : awayTeamId;
    const result = {
      eventTypeId: constants.Shot,
      gameWinningGoal: true,
      emptyNet: false,
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
      goals: {
        away: 0,
        home: 0,
      },
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
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.gamePk).toEqual(gamePk);
    expect(doc.gameType).toEqual(gameData.game.type);
    expect(doc.gameSeason).toEqual(parseInt(gameData.game.season, 10));
    expect(doc.venue).toEqual(gameData.venue.name);
    expect(doc.eventTypeId).toEqual(result.eventTypeId);
    expect(doc.gameWinningGoal).toEqual(true);
    expect(doc.emptyNet).toEqual(false);
    expect(doc.penaltySeverity).toEqual('Major');
    expect(doc.penaltyMinutes).toEqual(4);
    expect(doc.secondaryType).toEqual('Wrist Shot');
    expect(doc.playTime).toEqual(156);
    expect(doc._id.dateTime).toBeDefined();
    expect(doc.x).toEqual(x);
    expect(doc.y).toEqual(y);

    expect(doc.teamId).toEqual(teamId);
    expect(doc.teamStatus).toEqual(status);
  });

  test.each([
    [constants.Home, constants.Hit, constants.Hittee, constants.Away, 'Forward'],
    [constants.Home, constants.BlockedShot, constants.ShotBlocked, constants.Away, 'Forward'],
    [constants.Home, constants.Shot, constants.Save, constants.Away, 'Forward'],
    [constants.Home, constants.Faceoff, constants.FaceoffLoss, constants.Away, 'Forward'],
    [constants.Home, constants.Penalty, constants.PenaltyDrawn, constants.Away, 'Forward'],
    [constants.Home, constants.Goal, constants.Assist, constants.Home, 'Forward'],
    [constants.Home, constants.Goal, constants.GoalAllowed, constants.Away, constants.GoalieType],
    [constants.Away, constants.Hit, constants.Hittee, constants.Home, 'Forward'],
    [constants.Away, constants.BlockedShot, constants.ShotBlocked, constants.Home, 'Forward'],
    [constants.Away, constants.Shot, constants.Save, constants.Home, 'Forward'],
    [constants.Away, constants.Faceoff, constants.FaceoffLoss, constants.Home, 'Forward'],
    [constants.Away, constants.Penalty, constants.PenaltyDrawn, constants.Home, 'Forward'],
    [constants.Away, constants.Goal, constants.Assist, constants.Away, 'Forward'],
    [constants.Away, constants.Goal, constants.GoalAllowed, constants.Home, constants.GoalieType],
    [constants.Away, 'RANDOM', 'RANDOM', constants.Home, 'RANDOM'],
  ])('Should handle play with player data', (teamStatus, eventTypeId, secondEventTypeId, secondTeamStatus, secondaryPlayerType) => {
    const player1 = 666;
    const player2 = 555;
    const teamId = teamStatus === constants.Home ? homeTeamId : awayTeamId;
    const secondTeamId = secondTeamStatus === constants.Home ? homeTeamId : awayTeamId;

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
        goals: {
          away: 1,
          home: 0,
        },
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

    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);

    expect(events.length).toEqual(2);

    let doc = events[0];
    expect(doc.eventTypeId).toEqual(eventTypeId);
    expect(doc._id.playerId).toEqual(player1);
    expect(doc.handedness).toEqual('L');
    expect(doc.teamId).toEqual(teamId);
    expect(doc.teamStatus).toEqual(teamStatus);
    expect(doc.teamStrength).toEqual(5);
    expect(doc.teamScore).toEqual(teamStatus === constants.Home ? 0 : 1);
    expect(doc.opposingTeamId).not.toEqual(teamId);
    expect(doc.opposingStrength).toEqual(5);
    expect(doc.opposingTeamScore).toEqual(teamStatus === constants.Home ? 1 : 0);

    doc = events[1];
    expect(doc.eventTypeId).toEqual(secondEventTypeId);
    expect(doc._id.playerId).toEqual(player2);
    expect(doc.handedness).toEqual('R');
    expect(doc.teamId).toEqual(secondTeamId);
    expect(doc.teamStatus).toEqual(secondTeamStatus);
    expect(doc.teamStrength).toEqual(5);
    expect(doc.teamScore).toEqual(secondTeamStatus === constants.Home ? 0 : 1);
    expect(doc.opposingTeamId).not.toEqual(secondTeamId);
    expect(doc.opposingStrength).toEqual(5);
    expect(doc.opposingTeamScore).toEqual(secondTeamStatus === constants.Home ? 1 : 0);
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
        goals: {
          away: 0,
          home: 0,
        },
      },
      players: [{
        player: {
          id: player1,
        },
      }],
      team: {
        id: 1,
      },
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
        teamId: 1,
      },
      {
        startTime: '02:36',
        endTime: '03:45',
        playerId: notInPlayerId2,
        period: 2,
        teamId: 2,
      },
      {
        startTime: '02:15',
        endTime: '03:45',
        playerId: notInPlayerId3,
        period: 4,
        teamId: 1,
      },
      {
        startTime: '02:15',
        endTime: '02:20',
        playerId: notInPlayerId4,
        period: 2,
        teamId: 2,
      },
      {
        startTime: '02:20',
        endTime: '03:45',
        playerId: alreadyInPlayerId,
        period: 2,
        teamId: 1,
      },
      {
        startTime: '02:35',
        endTime: '02:36',
        playerId: newPlayer1,
        period: 2,
        teamId: 2,
      },
    ];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
    expect(events.length).toEqual(1);

    const doc = events[0];
    expect(doc.players.length).toEqual(1);
    expect(doc.opposingPlayers.length).toEqual(1);

    let playerId = doc.players[0];
    expect(playerId).toEqual(player1);

    playerId = doc.opposingPlayers[0];
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
        goals: {
          away: 0,
          home: 0,
        },
      },
      players: [{
        player: {
          id: player1,
        },
      }],
      team: {
        id: 1,
      },
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
        goals: {
          away: 0,
          home: 0,
        },
      },
      players: [{
        player: {
          id: newPlayer1,
        },
      }],
      team: {
        id: 1,
      },
    }];

    gameShifts.data.data = [
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: notInPlayerId1,
        period: 2,
        teamId: 2,
      },
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: player1,
        period: 1,
        teamId: 1,
      },
      {
        startTime: '00:00',
        endTime: '03:45',
        playerId: newPlayer1,
        period: 1,
        teamId: 2,
      },
      {
        startTime: '18:55',
        endTime: '20:00',
        playerId: newPlayer1,
        period: 1,
        teamId: 2,
      },
    ];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
    expect(events.length).toEqual(2);

    let doc = events[0];
    expect(doc.players.length).toEqual(1);
    expect(doc.players[0]).toEqual(player1);
    expect(doc.opposingPlayers.length).toEqual(1);
    expect(doc.opposingPlayers[0]).toEqual(newPlayer1);

    doc = events[1];
    expect(doc.opposingPlayers.length).toEqual(1);
    expect(doc.opposingPlayers[0]).toEqual(newPlayer1);
    expect(doc.players.length).toEqual(0);
  });

  test.each([['R'], ['P']])('Should determine strength of play', (gameType) => {
    gameEvents.data.gameData.game.type = gameType;
    gameEvents.data.liveData.plays.allPlays = [
      {
        result: {
          eventTypeId: 'in1',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '02:30',
          goals: {
            away: 0,
            home: 0,
          },
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
          goals: {
            away: 0,
            home: 0,
          },
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
          goals: {
            away: 0,
            home: 0,
          },
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
          goals: {
            away: 0,
            home: 0,
          },
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
          eventTypeId: 'notin3',
        },
        about: {
          period: 1,
          periodType: 'regular',
          periodTime: '04:32',
          goals: {
            away: 0,
            home: 0,
          },
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
          eventTypeId: 'in3',
        },
        about: {
          period: 4,
          periodTime: '02:31',
          goals: {
            away: 0,
            home: 0,
          },
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
          eventTypeId: 'in4',
        },
        about: {
          period: 4,
          periodTime: '02:45',
          goals: {
            away: 0,
            home: 0,
          },
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
      {
        startTime: 3720,
        endTime: 3840,
        teamId: 1,
      },
      {
        startTime: 3764,
        endTime: 3800,
        teamId: 2,
      },
    ];

    goaliePulls = [
      {
        startTime: 271,
        endTime: 280,
        teamId: 1,
      },
    ];

    const events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
    expect(events.length).toEqual(7);

    let event = events.filter(x => x.eventTypeId === 'in1')[0];
    expect(event.teamStrength).toEqual(4);
    expect(event.opposingStrength).toEqual(4);

    event = events.filter(x => x.eventTypeId === 'in2')[0];
    expect(event.teamStrength).toEqual(5);
    expect(event.opposingStrength).toEqual(4);

    event = events.filter(x => x.eventTypeId === 'notin1')[0];
    expect(event.teamStrength).toEqual(5);
    expect(event.opposingStrength).toEqual(4);

    event = events.filter(x => x.eventTypeId === 'notin2')[0];
    expect(event.teamStrength).toEqual(5);
    expect(event.opposingStrength).toEqual(6);

    event = events.filter(x => x.eventTypeId === 'notin3')[0];
    expect(event.teamStrength).toEqual(6);
    expect(event.opposingStrength).toEqual(5);

    if (gameType === 'R') {
      event = events.filter(x => x.eventTypeId === 'in3')[0];
      expect(event.teamStrength).toEqual(3);
      expect(event.opposingStrength).toEqual(4);

      event = events.filter(x => x.eventTypeId === 'in4')[0];
      expect(event.teamStrength).toEqual(4);
      expect(event.opposingStrength).toEqual(4);
    } else {
      event = events.filter(x => x.eventTypeId === 'in3')[0];
      expect(event.teamStrength).toEqual(4);
      expect(event.opposingStrength).toEqual(5);

      event = events.filter(x => x.eventTypeId === 'in4')[0];
      expect(event.teamStrength).toEqual(4);
      expect(event.opposingStrength).toEqual(4);
    }
  });
});
