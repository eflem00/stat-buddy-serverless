const constructLivePlays = require('../constructLivePlays');
const constants = require('../../../common/constants');

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
    },
    liveData: {
      boxscore: {
        teams: {
          away: {
            team: {
              id: '1',
            },
            players: {},
          },
          home: {
            team: {
              id: '2',
            },
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
            goals: 3,
            assists: 5,
            shots: 5,
            blocked: 1,
            hits: 2,
            faceOffWins: 7,
            faceoffTaken: 10,
            takeaways: 3,
            giveaways: 4,
            powerPlayGoals: 2,
            shortHandedGoals: 1,
            powerPlayAssists: 2,
            shortHandedAssists: 3,
          },
        },
        position: {
          type: 'Forward',
        },
      },
      player2: {
        person: {
          id: '2',
          shootsCatches: 'R',
        },
        stats: {
          skaterStats: {
            powerPlaySaves: 2,
            evenSaves: 1,
            shortHandedSaves: 2,
            evenShotsAgainst: 3,
            powerPlayShotsAgainst: 2,
            shortHandedShotsAgainst: 3,
          },
        },
        position: {
          type: constants.GoalieType,
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
            giveaways: 3,
            powerPlayGoals: 2,
            shortHandedGoals: 1,
            powerPlayAssists: 4,
            shortHandedAssists: 3,
          },
        },
        position: {
          type: 'Forward',
        },
      },
      player2: {
        person: {
          id: '4',
          shootsCatches: 'R',
        },
        stats: {
          skaterStats: {
            powerPlaySaves: 1,
            evenSaves: 1,
            shortHandedSaves: 1,
            evenShotsAgainst: 2,
            powerPlayShotsAgainst: 2,
            shortHandedShotsAgainst: 1,
          },
        },
        position: {
          type: constants.GoalieType,
        },
      },
      player3: {
        person: {
          id: '4',
          shootsCatches: 'R',
        },
        stats: {},
        position: {
          type: constants.GoalieType,
        },
      },
    };

    gameEvents.data.liveData.boxscore.teams.away.players = awayPlayers;
    gameEvents.data.liveData.boxscore.teams.home.players = homePlayers;

    const events = constructLivePlays(gamePk, gameEvents);

    const event = events[0];
    expect(event.gamePk).toEqual(gamePk);
    expect(event.dateTime).toEqual(gameEvents.data.gameData.datetime.dateTime);

    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Goal).length).toEqual(3);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Goal && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Goal && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(2);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Goal && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(0);

    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Assist).length).toEqual(5);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Assist && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(3);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Assist && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(2);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Assist && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(0);

    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Shot).length).toEqual(5);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.BlockedShot).length).toEqual(1);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Hit).length).toEqual(2);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Faceoff).length).toEqual(7);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.FaceoffLoss).length).toEqual(3);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Takeaway).length).toEqual(3);
    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Giveaway).length).toEqual(4);

    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.Save).length).toEqual(5);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Save && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(2);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Save && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x => x.teamId === '1' && x.eventTypeId === constants.Save && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(2);

    expect(events.filter(x => x.teamId === '1' && x.eventTypeId === constants.GoalAllowed).length).toEqual(3);
    expect(
      events.filter(
        x =>
          x.teamId === '1' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 4 &&
          x.opposingStrength === 5,
      ).length,
    ).toEqual(0);
    expect(
      events.filter(
        x =>
          x.teamId === '1' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 5 &&
          x.opposingStrength === 5,
      ).length,
    ).toEqual(2);
    expect(
      events.filter(
        x =>
          x.teamId === '1' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 5 &&
          x.opposingStrength === 4,
      ).length,
    ).toEqual(1);

    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Goal).length).toEqual(4);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Goal && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Goal && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(2);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Goal && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);

    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Assist).length).toEqual(8);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Assist && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(3);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Assist && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(4);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Assist && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);

    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Shot).length).toEqual(7);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.BlockedShot).length).toEqual(2);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Hit).length).toEqual(4);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Faceoff).length).toEqual(3);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.FaceoffLoss).length).toEqual(4);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Takeaway).length).toEqual(4);
    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Giveaway).length).toEqual(3);

    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.Save).length).toEqual(3);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Save && x.teamStrength === 4 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Save && x.teamStrength === 5 && x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x => x.teamId === '2' && x.eventTypeId === constants.Save && x.teamStrength === 5 && x.opposingStrength === 4,
      ).length,
    ).toEqual(1);

    expect(events.filter(x => x.teamId === '2' && x.eventTypeId === constants.GoalAllowed).length).toEqual(2);
    expect(
      events.filter(
        x =>
          x.teamId === '2' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 4 &&
          x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x =>
          x.teamId === '2' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 5 &&
          x.opposingStrength === 5,
      ).length,
    ).toEqual(1);
    expect(
      events.filter(
        x =>
          x.teamId === '2' &&
          x.eventTypeId === constants.GoalAllowed &&
          x.teamStrength === 5 &&
          x.opposingStrength === 4,
      ).length,
    ).toEqual(0);
  });
});
