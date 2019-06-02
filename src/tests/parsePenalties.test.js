const parsePenalties = require('../parsePenalties');

describe('Test the parsePenalties Method', () => {
  const gameEvents = {
    data: {
      liveData: {
        plays: {
          allPlays: [],
        },
      },
    },
  };
  test('Should handle plays with different play types data', () => {
    const plays = [
      {
        result: {
          eventTypeId: 'PENALTY',
          secondaryType: 'Tripping',
          penaltyMinutes: 2,
        },
        about: {
          period: 2,
          periodTime: '17:01',
        },
        team: {
          id: 2,
        },
      },
      {
        result: {
          eventTypeId: 'PENALTY',
          secondaryType: 'Fighting',
          penaltyMinutes: 5,
        },
        about: {
          period: 1,
          periodTime: '03:01',
        },
        team: {
          id: 1,
        },
      },
      {
        result: {
          eventTypeId: 'SHOT',
          secondaryType: 'Wrist Shot',
        },
        about: {
          period: 3,
          periodTime: '05:59',
        },
        team: {
          id: 2,
        },
      },
    ];
    gameEvents.data.liveData.plays.allPlays = plays;

    const penalties = parsePenalties(gameEvents);

    expect(penalties.length).toEqual(1);

    const penalty = penalties[0];

    expect(penalty.startTime).toEqual(2221);
    expect(penalty.endTime).toEqual(2341);
    expect(penalty.teamId).toEqual(2);
  });
});
