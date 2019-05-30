const constructLivePlays = require('../constructLivePlays');

const gamePk = 123456;
const gameEvents = {
  gamePk,
  data: {
    gameData: {
      game: {
        type: 'R',
        season: '20172018',
      },
      venue: {
        name: 'Little Caesars',
      },
      datetime: {
        dateTime: '2017-08-16T13:56:23.123Z',
      },
      teams: {
        away: {
          id: '1',
        },
        home: {
          id: '2',
        },
      },
    },
    liveData: {
      boxscore: {
        teams: {
          away: {
            players: {}
          },
          home: {
            players: {},
          },
        },
      },
    },
  },
};

describe('Test the constructLivePlays', () => {
  test('It should not throw with empty data', () => {
    expect(() => constructLivePlays(gamePk, gameEvents)).not.toThrow();
  });

  test('It should count correct box scores', () => {
    const awayPlayers = {
      player1: {
        person: {
          id: '1',
          shootsCatches: 'L',
        },
        stats: {
          skaterStats: {
            goals: 2,
            assists: 4,
            shots: 5,
            blocked: 1,
            hits: 2,
            faceOffWins: 7,
            faceoffTaken: 10,
            takeaways: 3,
            giveaways: 4
          },
        },
        position: {
          code: 'F',
        },
      },
      player2: {
        person: {
          id: '2',
          shootsCatches: 'R',
        },
        stats: {
          skaterStats: {},
        },
        position: {
          code: 'G',
        },
      },
    };
    const homePlayers = {
      player1: {
        person: {
          id: '3',
          shootsCatches: 'R',
        },
        stats: {
          skaterStats: {
            goals: 4,
            assists: 8,
            shots: 7,
            blocked: 2,
            hits: 4,
            faceOffWins: 3,
            faceoffTaken: 7,
            takeaways: 4,
            giveaways: 3
          },
        },
        position: {
          code: 'F',
        },
      },
      player2: {
        person: {
          id: '4',
          shootsCatches: 'R',
        },
        stats: {
          skaterStats: {},
        },
        position: {
          code: 'G',
        },
      },
    };

    gameEvents.data.liveData.boxscore.teams.away.players = awayPlayers;
    gameEvents.data.liveData.boxscore.teams.home.players = homePlayers;

    const events = constructLivePlays(gamePk, gameEvents);

    const event = events[0];
    expect(event.game_pk).toEqual(gamePk);
    expect(event.game_type).toEqual(gameEvents.data.gameData.game.type);
    expect(event.game_season).toEqual(gameEvents.data.gameData.game.season);
    expect(event.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(event.date_time).toEqual(gameEvents.data.gameData.datetime.dateTime);

    expect(events.filter(x => x.event_type_id === 'GOAL').length).toEqual(6);
    expect(events.filter(x => x.event_type_id === 'SHOT').length).toEqual(12);
    expect(events.filter(x => x.event_type_id === 'HIT').length).toEqual(6);
    expect(events.filter(x => x.event_type_id === 'FACEOFF').length).toEqual(10);
    expect(events.filter(x => x.event_type_id === 'TAKEAWAY').length).toEqual(7);
    expect(events.filter(x => x.event_type_id === 'GIVEAWAY').length).toEqual(7);

    let count = 0;
    events.forEach((event) => {
      event.players.forEach((player) => {
        if (player.type === 'Assist') {
          count += 1;
        }
      });
    })
    expect(count).toEqual(12);

    count = 0;
    events.forEach((event) => {
      event.players.forEach((player) => {
        if (player.type === 'Assist') {
          count += 1;
        }
      });
    })
    expect(count).toEqual(12);
  });
});
