const parsePenalties = require('../parsePenalties');
const constants = require('../constants');

describe('Test the parsePenalties Method', () => {
  const gameEvents = {
    data: {
      gameData: {
        game: {
          type: 'R',
        },
      },
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
          eventTypeId: constants.Penalty,
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
          eventTypeId: constants.Penalty,
          secondaryType: constants.FightingPenaltyType,
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
          eventTypeId: constants.Goal,
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
      {
        result: {
          eventTypeId: constants.Goal,
          secondaryType: 'Wrist Shot',
        },
        about: {
          period: 2,
          periodTime: '17:38',
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

  test.each([
    [2, '17:01', 2, 2, '17:38', 2221, 2258],
    [2, '17:01', 4, 2, '17:38', 2221, 2378],
    [2, '17:01', 5, 2, '17:38', 2221, 2521],
  ])('Should subtract time from 2/4 min penalties when goal scored', (penaltyPeriod, penaltyTime, penaltyMinutes, goalPeriod, goalTime, startTime, endTime) => {
    const plays = [
      {
        result: {
          eventTypeId: constants.Penalty,
          secondaryType: 'Tripping',
          penaltyMinutes,
        },
        about: {
          period: penaltyPeriod,
          periodTime: penaltyTime,
        },
        team: {
          id: 2,
        },
      },
      {
        result: {
          eventTypeId: constants.Goal,
          secondaryType: 'Wrist shot',
        },
        about: {
          period: goalPeriod,
          periodTime: goalTime,
        },
        team: {
          id: 3,
        },
      },
    ];
    gameEvents.data.liveData.plays.allPlays = plays;

    const penalties = parsePenalties(gameEvents);

    expect(penalties.length).toEqual(1);

    const penalty = penalties[0];

    expect(penalty.startTime).toEqual(startTime);
    expect(penalty.endTime).toEqual(endTime);
  });

  test('Should only subtract time from first penalty', () => {
    const plays = [
      {
        result: {
          eventTypeId: constants.Penalty,
          secondaryType: 'Tripping',
          penaltyMinutes: 2,
        },
        about: {
          period: 1,
          periodTime: '02:45',
        },
        team: {
          id: 2,
        },
      },
      {
        result: {
          eventTypeId: constants.Penalty,
          secondaryType: 'Tripping',
          penaltyMinutes: 4,
        },
        about: {
          period: 1,
          periodTime: '03:30',
        },
        team: {
          id: 2,
        },
      },
      {
        result: {
          eventTypeId: constants.Goal,
          secondaryType: 'Wrist shot',
        },
        about: {
          period: 1,
          periodTime: '03:00',
        },
        team: {
          id: 3,
        },
      },
    ];
    gameEvents.data.liveData.plays.allPlays = plays;

    const penalties = parsePenalties(gameEvents);

    expect(penalties.length).toEqual(2);

    let penalty = penalties[0];
    expect(penalty.startTime).toEqual(165);
    expect(penalty.endTime).toEqual(180);

    penalty = penalties[1];
    expect(penalty.startTime).toEqual(210);
    expect(penalty.endTime).toEqual(450);
  });
});
