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
                position: {
                  type: 'Forward',
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
              player4: {
                person: {
                  id: 4,
                },
                position: {
                  type: 'Goalie',
                },
                stats: {
                  goalieStats: {
                    timeOnIce: '62:00',
                    decision: 'W',
                  },
                },
              },
              player6: {
                person: {
                  id: 6,
                },
                position: {
                  type: 'Goalie',
                },
                stats: {
                  goalieStats: {
                    timeOnIce: '01:00',
                    decision: '',
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
                position: {
                  type: 'Forward',
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
              player5: {
                person: {
                  id: 5,
                },
                position: {
                  type: 'Goalie',
                },
                stats: {
                  goalieStats: {
                    timeOnIce: '63:00',
                    decision: 'L',
                  },
                },
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
const gameShifts = {
  data: {
    data: [
      {
        period: 1,
        startTime: '00:00',
        playerId: 4,
      },
      {
        period: 1,
        startTime: '00:00',
        playerId: 5,
      },
      {
        period: 1,
        startTime: '12:00',
        playerId: 6,
      },
    ],
  },
};


describe('Test the parseBoxScore Method', () => {
  test('Should handle basic data', () => {
    const summaries = parseBoxScores(gamePk, gameEvents, gameSummaries, gameShifts);
    expect(summaries.length).toEqual(7);

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

    const firstGoalieSummary = summaries[2];
    const firstGoalieInfo = gameEvents.data.liveData.boxscore.teams.away.players.player4;
    expect(firstGoalieSummary.id).toEqual(firstGoalieInfo.person.id);
    expect(firstGoalieSummary.timeOnIce).toEqual(timeHelper.timeToInt(firstGoalieInfo.stats.goalieStats.timeOnIce));
    expect(firstGoalieSummary.decision).toEqual('W');
    expect(firstGoalieSummary.started).toEqual(true);
    expect(firstGoalieSummary.dateTime).toEqual(gameSummaries.data.data[0].gameDate);
    expect(firstGoalieSummary.gamePk).toEqual(gameSummaries.data.data[0].gameId);
    expect(firstGoalieSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(firstGoalieSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(firstGoalieSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(firstGoalieSummary.opposingTeamId).toEqual(gameSummaries.data.data[1].teamId);
    expect(firstGoalieSummary.win).toEqual(gameSummaries.data.data[1].losses);
    expect(firstGoalieSummary.tie).toEqual(gameSummaries.data.data[0].ties);
    expect(firstGoalieSummary.loss).toEqual(gameSummaries.data.data[0].losses);
    expect(firstGoalieSummary.otWin).toEqual(gameSummaries.data.data[1].otLosses);
    expect(firstGoalieSummary.otLoss).toEqual(gameSummaries.data.data[0].otLosses);
    expect(firstGoalieSummary.soWin).toEqual(gameSummaries.data.data[0].shootoutGamesWon);
    expect(firstGoalieSummary.soLoss).toEqual(gameSummaries.data.data[0].shootoutGamesLost);
    expect(firstGoalieSummary.points).toEqual(gameSummaries.data.data[0].points);

    const secondGoalieSummary = summaries[3];
    const secondGoalieInfo = gameEvents.data.liveData.boxscore.teams.away.players.player6;
    expect(secondGoalieSummary.id).toEqual(secondGoalieInfo.person.id);
    expect(secondGoalieSummary.timeOnIce).toEqual(timeHelper.timeToInt(secondGoalieInfo.stats.goalieStats.timeOnIce));
    expect(secondGoalieSummary.decision).toEqual('X');
    expect(secondGoalieSummary.started).toEqual(false);
    expect(secondGoalieSummary.dateTime).toEqual(gameSummaries.data.data[0].gameDate);
    expect(secondGoalieSummary.gamePk).toEqual(gameSummaries.data.data[0].gameId);
    expect(secondGoalieSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(secondGoalieSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(secondGoalieSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(secondGoalieSummary.opposingTeamId).toEqual(gameSummaries.data.data[1].teamId);
    expect(secondGoalieSummary.win).toEqual(gameSummaries.data.data[1].losses);
    expect(secondGoalieSummary.tie).toEqual(gameSummaries.data.data[0].ties);
    expect(secondGoalieSummary.loss).toEqual(gameSummaries.data.data[0].losses);
    expect(secondGoalieSummary.otWin).toEqual(gameSummaries.data.data[1].otLosses);
    expect(secondGoalieSummary.otLoss).toEqual(gameSummaries.data.data[0].otLosses);
    expect(secondGoalieSummary.soWin).toEqual(gameSummaries.data.data[0].shootoutGamesWon);
    expect(secondGoalieSummary.soLoss).toEqual(gameSummaries.data.data[0].shootoutGamesLost);
    expect(secondGoalieSummary.points).toEqual(gameSummaries.data.data[0].points);

    const secondTeamSummary = summaries[4];
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

    const secondPlayerSummary = summaries[5];
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

    const thirdGoalieSummary = summaries[6];
    const thirdGoalieInfo = gameEvents.data.liveData.boxscore.teams.home.players.player5;
    expect(thirdGoalieSummary.id).toEqual(thirdGoalieInfo.person.id);
    expect(thirdGoalieSummary.timeOnIce).toEqual(timeHelper.timeToInt(thirdGoalieInfo.stats.goalieStats.timeOnIce));
    expect(thirdGoalieSummary.decision).toEqual('L');
    expect(thirdGoalieSummary.started).toEqual(true);
    expect(thirdGoalieSummary.dateTime).toEqual(gameSummaries.data.data[1].gameDate);
    expect(thirdGoalieSummary.gamePk).toEqual(gameSummaries.data.data[1].gameId);
    expect(thirdGoalieSummary.gameType).toEqual(gameEvents.data.gameData.game.type);
    expect(thirdGoalieSummary.gameSeason).toEqual(parseInt(gameEvents.data.gameData.game.season, 10));
    expect(thirdGoalieSummary.venue).toEqual(gameEvents.data.gameData.venue.name);
    expect(thirdGoalieSummary.opposingTeamId).toEqual(gameSummaries.data.data[0].teamId);
    expect(thirdGoalieSummary.win).toEqual(gameSummaries.data.data[0].losses);
    expect(thirdGoalieSummary.tie).toEqual(gameSummaries.data.data[1].ties);
    expect(thirdGoalieSummary.loss).toEqual(gameSummaries.data.data[1].losses);
    expect(thirdGoalieSummary.otWin).toEqual(gameSummaries.data.data[0].otLosses);
    expect(thirdGoalieSummary.otLoss).toEqual(gameSummaries.data.data[1].otLosses);
    expect(thirdGoalieSummary.soWin).toEqual(gameSummaries.data.data[1].shootoutGamesWon);
    expect(thirdGoalieSummary.soLoss).toEqual(gameSummaries.data.data[1].shootoutGamesLost);
    expect(thirdGoalieSummary.points).toEqual(gameSummaries.data.data[1].points);
  });

  test('Should handle team ids swapped', () => {
    gameSummaries.data.data[0].teamId = 2;
    gameSummaries.data.data[1].teamId = 1;
    const summaries = parseBoxScores(gamePk, gameEvents, gameSummaries, gameShifts);
    expect(summaries.length).toEqual(7);
  });
});
