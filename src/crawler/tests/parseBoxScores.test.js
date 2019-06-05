const parseBoxScores = require('../parseBoxScores');
const timeHelper = require('../timeHelper');

const gamePk = 2017020001;
const gameEvents = {
  data: {
    gameData: {
      game: {
        season: '20172018',
        type: 'R',
      },
      venue: {
        name: 'Madison Square Garden',
      },
    },
    liveData: {
      boxscore: {
        teams: {
          away: {
            team: {
              id: 1,
            },
            players: {
              player1: {
                person: {
                  id: 1,
                },
                stats: {
                  skaterStats: {
                    timeOnIce: '01:11',
                    evenTimeOnIce: '2:22',
                    powerPlayTimeOnIce: '3:33',
                    shortHandedTimeOnIce: '4:44',
                  },
                },
              },
            },
          },
          home: {
            team: {
              id: 2,
            },
            players: {
              player2: {
                person: {
                  id: 2,
                },
                stats: {
                  skaterStats: {
                    timeOnIce: '00:00',
                    evenTimeOnIce: '00:01',
                    powerPlayTimeOnIce: '00:02',
                    shortHandedTimeOnIce: '00:03',
                  },
                },
              },
              player3: {
                person: {
                  id: 3,
                },
                stats: {},
              },
            },
          },
        },
      },
    },
  },
};
const gameSummaries = {
  data: {
    data: [
      {
        teamId: 1,
        gameDate: '2017-10-04T22:00:00Z',
        gameId: 2017020001,
        wins: 1,
        losses: 2,
        ties: 3,
        otLosses: 4,
        shootoutGamesLost: 5,
        shootoutGamesWon: 6,
        points: 7,
      },
      {
        teamId: 2,
        gameDate: '2017-10-04T22:00:00Z',
        gameId: 2017020001,
        wins: 8,
        losses: 9,
        ties: 10,
        otLosses: 11,
        shootoutGamesLost: 12,
        shootoutGamesWon: 13,
        points: 14,
      },
    ],
  },
};


describe('Test the parseBoxScore Method', () => {
  test('Should handle basic data', () => {
    const summaries = parseBoxScores(gamePk, gameEvents, gameSummaries);
    expect(summaries.length).toEqual(5);

    const firstTeamSummary = summaries[0];
    expect(firstTeamSummary.id).toEqual(gameSummaries.data.data[0].teamId);
    expect(firstTeamSummary.dateTime).toEqual(gameSummaries.data.data[0].gameDate);
    expect(firstTeamSummary.gamePk).toEqual(gameSummaries.data.data[0].gameId);
    expect(firstTeamSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(firstTeamSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(firstTeamSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(firstTeamSummary.opposingTeamId).toEqual(gameSummaries.data.data[1].teamId);
    expect(firstTeamSummary.win).toEqual(gameSummaries.data.data[1].losses);
    expect(firstTeamSummary.tie).toEqual(gameSummaries.data.data[0].ties);
    expect(firstTeamSummary.loss).toEqual(gameSummaries.data.data[0].losses);
    expect(firstTeamSummary.otWin).toEqual(gameSummaries.data.data[1].otLosses);
    expect(firstTeamSummary.otLoss).toEqual(gameSummaries.data.data[0].otLosses);
    expect(firstTeamSummary.soWin).toEqual(gameSummaries.data.data[0].shootoutGamesWon);
    expect(firstTeamSummary.soLoss).toEqual(gameSummaries.data.data[0].shootoutGamesLost);
    expect(firstTeamSummary.points).toEqual(gameSummaries.data.data[0].points);

    const firstPlayerSummary = summaries[1];
    const firstPlayerInfo = gameEvents.data.liveData.boxscore.teams.away.players.player1;
    expect(firstPlayerSummary.id).toEqual(firstPlayerInfo.person.id);
    expect(firstPlayerSummary.timeOnIce).toEqual(timeHelper.timeToInt(firstPlayerInfo.stats.skaterStats.timeOnIce));
    expect(firstPlayerSummary.evenTimeOnIce).toEqual(timeHelper.timeToInt(firstPlayerInfo.stats.skaterStats.evenTimeOnIce));
    expect(firstPlayerSummary.powerPlayTimeOnIce).toEqual(timeHelper.timeToInt(firstPlayerInfo.stats.skaterStats.powerPlayTimeOnIce));
    expect(firstPlayerSummary.shortHandedTimeOnIce).toEqual(timeHelper.timeToInt(firstPlayerInfo.stats.skaterStats.shortHandedTimeOnIce));
    expect(firstPlayerSummary.dateTime).toEqual(gameSummaries.data.data[0].gameDate);
    expect(firstPlayerSummary.gamePk).toEqual(gameSummaries.data.data[0].gameId);
    expect(firstPlayerSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(firstPlayerSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(firstPlayerSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(firstPlayerSummary.opposingTeamId).toEqual(gameSummaries.data.data[1].teamId);
    expect(firstPlayerSummary.win).toEqual(gameSummaries.data.data[1].losses);
    expect(firstPlayerSummary.tie).toEqual(gameSummaries.data.data[0].ties);
    expect(firstPlayerSummary.loss).toEqual(gameSummaries.data.data[0].losses);
    expect(firstPlayerSummary.otWin).toEqual(gameSummaries.data.data[1].otLosses);
    expect(firstPlayerSummary.otLoss).toEqual(gameSummaries.data.data[0].otLosses);
    expect(firstPlayerSummary.soWin).toEqual(gameSummaries.data.data[0].shootoutGamesWon);
    expect(firstPlayerSummary.soLoss).toEqual(gameSummaries.data.data[0].shootoutGamesLost);
    expect(firstPlayerSummary.points).toEqual(gameSummaries.data.data[0].points);

    const secondTeamSummary = summaries[2];
    expect(secondTeamSummary.id).toEqual(gameSummaries.data.data[1].teamId);
    expect(secondTeamSummary.dateTime).toEqual(gameSummaries.data.data[1].gameDate);
    expect(secondTeamSummary.gamePk).toEqual(gameSummaries.data.data[1].gameId);
    expect(secondTeamSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(secondTeamSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(secondTeamSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(secondTeamSummary.opposingTeamId).toEqual(gameSummaries.data.data[0].teamId);
    expect(secondTeamSummary.win).toEqual(gameSummaries.data.data[0].losses);
    expect(secondTeamSummary.tie).toEqual(gameSummaries.data.data[1].ties);
    expect(secondTeamSummary.loss).toEqual(gameSummaries.data.data[1].losses);
    expect(secondTeamSummary.otWin).toEqual(gameSummaries.data.data[0].otLosses);
    expect(secondTeamSummary.otLoss).toEqual(gameSummaries.data.data[1].otLosses);
    expect(secondTeamSummary.soWin).toEqual(gameSummaries.data.data[1].shootoutGamesWon);
    expect(secondTeamSummary.soLoss).toEqual(gameSummaries.data.data[1].shootoutGamesLost);
    expect(secondTeamSummary.points).toEqual(gameSummaries.data.data[1].points);

    const secondPlayerSummary = summaries[3];
    const secondPlayerInfo = gameEvents.data.liveData.boxscore.teams.home.players.player2;
    expect(secondPlayerSummary.id).toEqual(secondPlayerInfo.person.id);
    expect(secondPlayerSummary.timeOnIce).toEqual(timeHelper.timeToInt(secondPlayerInfo.stats.skaterStats.timeOnIce));
    expect(secondPlayerSummary.evenTimeOnIce).toEqual(timeHelper.timeToInt(secondPlayerInfo.stats.skaterStats.evenTimeOnIce));
    expect(secondPlayerSummary.powerPlayTimeOnIce).toEqual(timeHelper.timeToInt(secondPlayerInfo.stats.skaterStats.powerPlayTimeOnIce));
    expect(secondPlayerSummary.shortHandedTimeOnIce).toEqual(timeHelper.timeToInt(secondPlayerInfo.stats.skaterStats.shortHandedTimeOnIce));
    expect(secondPlayerSummary.dateTime).toEqual(gameSummaries.data.data[1].gameDate);
    expect(secondPlayerSummary.gamePk).toEqual(gameSummaries.data.data[1].gameId);
    expect(secondPlayerSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(secondPlayerSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(secondPlayerSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(secondPlayerSummary.opposingTeamId).toEqual(gameSummaries.data.data[0].teamId);
    expect(secondPlayerSummary.win).toEqual(gameSummaries.data.data[0].losses);
    expect(secondPlayerSummary.tie).toEqual(gameSummaries.data.data[1].ties);
    expect(secondPlayerSummary.loss).toEqual(gameSummaries.data.data[1].losses);
    expect(secondPlayerSummary.otWin).toEqual(gameSummaries.data.data[0].otLosses);
    expect(secondPlayerSummary.otLoss).toEqual(gameSummaries.data.data[1].otLosses);
    expect(secondPlayerSummary.soWin).toEqual(gameSummaries.data.data[1].shootoutGamesWon);
    expect(secondPlayerSummary.soLoss).toEqual(gameSummaries.data.data[1].shootoutGamesLost);
    expect(secondPlayerSummary.points).toEqual(gameSummaries.data.data[1].points);

    const thirdPlayerSummary = summaries[4];
    const thirdPlayerInfo = gameEvents.data.liveData.boxscore.teams.home.players.player3;
    expect(thirdPlayerSummary.id).toEqual(thirdPlayerInfo.person.id);
    expect(thirdPlayerSummary.timeOnIce).toEqual(0);
    expect(thirdPlayerSummary.evenTimeOnIce).toEqual(0);
    expect(thirdPlayerSummary.powerPlayTimeOnIce).toEqual(0);
    expect(thirdPlayerSummary.shortHandedTimeOnIce).toEqual(0);
    expect(thirdPlayerSummary.dateTime).toEqual(gameSummaries.data.data[1].gameDate);
    expect(thirdPlayerSummary.gamePk).toEqual(gameSummaries.data.data[1].gameId);
    expect(thirdPlayerSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(thirdPlayerSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(thirdPlayerSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(thirdPlayerSummary.opposingTeamId).toEqual(gameSummaries.data.data[0].teamId);
    expect(thirdPlayerSummary.win).toEqual(gameSummaries.data.data[0].losses);
    expect(thirdPlayerSummary.tie).toEqual(gameSummaries.data.data[1].ties);
    expect(thirdPlayerSummary.loss).toEqual(gameSummaries.data.data[1].losses);
    expect(thirdPlayerSummary.otWin).toEqual(gameSummaries.data.data[0].otLosses);
    expect(thirdPlayerSummary.otLoss).toEqual(gameSummaries.data.data[1].otLosses);
    expect(thirdPlayerSummary.soWin).toEqual(gameSummaries.data.data[1].shootoutGamesWon);
    expect(thirdPlayerSummary.soLoss).toEqual(gameSummaries.data.data[1].shootoutGamesLost);
    expect(thirdPlayerSummary.points).toEqual(gameSummaries.data.data[1].points);
  });

  test('Should handle team ids swapped', () => {
    gameSummaries.data.data[0].teamId = 2;
    gameSummaries.data.data[1].teamId = 1;
    const summaries = parseBoxScores(gamePk, gameEvents, gameSummaries);
    expect(summaries.length).toEqual(5);
  });
});
