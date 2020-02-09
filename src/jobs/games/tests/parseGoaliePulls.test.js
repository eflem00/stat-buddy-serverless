const parseGoaliePulls = require('../parseGoaliePulls');

describe('Test the parseGoaliePulls Method', () => {
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
        boxscore: {
          teams: {
            away: {
              team: {
                id: 1,
              },
              goalies: [1, 2],
            },
            home: {
              team: {
                id: 2,
              },
              goalies: [3, 4],
            },
          },
        },
      },
    },
  };
  const gameShifts = {
    data: {
      data: [],
    },
  };

  test('Should acount for goalie switches', () => {
    gameShifts.data.data = [
      {
        period: 1,
        startTime: '00:00',
        endTime: '10:00',
        playerId: 1,
      },
      {
        period: 1,
        startTime: '10:00',
        endTime: '20:00',
        playerId: 2,
      },
      {
        period: 2,
        startTime: '00:00',
        endTime: '10:00',
        playerId: 3,
      },
      {
        period: 2,
        startTime: '10:00',
        endTime: '20:00',
        playerId: 4,
      },
      {
        period: 3,
        startTime: '00:00',
        endTime: '20:00',
        playerId: 666,
      },
    ];
    const goaliePulls = parseGoaliePulls(gameEvents, gameShifts);
    expect(goaliePulls.length).toEqual(0);
  });

  test('Should find golaie pulls', () => {
    gameShifts.data.data = [
      {
        period: 1,
        startTime: '00:00',
        endTime: '10:00',
        playerId: 1,
      },
      {
        period: 1,
        startTime: '11:00',
        endTime: '20:00',
        playerId: 2,
      },
      {
        period: 2,
        startTime: '00:00',
        endTime: '14:00',
        playerId: 3,
      },
      {
        period: 2,
        startTime: '15:00',
        endTime: '16:00',
        playerId: 4,
      },
      {
        period: 2,
        startTime: '16:00',
        endTime: '20:00',
        playerId: 3,
      },
    ];
    const goaliePulls = parseGoaliePulls(gameEvents, gameShifts);
    expect(goaliePulls.length).toEqual(2);

    const awayGoaliePull = goaliePulls[0];
    expect(awayGoaliePull.teamId).toEqual(gameEvents.data.liveData.boxscore.teams.away.team.id);
    expect(awayGoaliePull.startTime).toEqual(600);
    expect(awayGoaliePull.endTime).toEqual(660);

    const homeGoaliePull = goaliePulls[1];
    expect(homeGoaliePull.teamId).toEqual(gameEvents.data.liveData.boxscore.teams.home.team.id);
    expect(homeGoaliePull.startTime).toEqual(2040);
    expect(homeGoaliePull.endTime).toEqual(2100);
  });
});
