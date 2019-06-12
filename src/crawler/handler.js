const request = require('axios');
const moment = require('moment');
const aws = require('aws-sdk');
const parseLivePlays = require('./parseLivePlays');
const constructLivePlays = require('./constructLivePlays');
const parsePenalties = require('./parsePenalties');
const parseBoxScores = require('./parseBoxScores');
const parseGoaliePulls = require('./parseGoaliePulls');
const constants = require('./constants');

aws.config.update({ region: process.env.REGION });
const ddb = new aws.DynamoDB.DocumentClient();

module.exports.crawl = async () => {
  try {
    // Get the start index
    const response = await ddb.get({
      TableName: constants.IndexesTable,
      Key: {
        id: constants.IndexId,
      },
    }).promise();
    const startIndex = moment(response.Item.startIndex);
    // const startIndex = moment('2018-02-17');

    console.log('Beginning crawl for date: ', startIndex.format('YYYY-MM-DD'));

    // Get the games for the given startIndex
    const schedule = await request(`https://statsapi.web.nhl.com/api/v1/schedule?date=${startIndex.format('YYYY-MM-DD')}`);
    if (schedule.data.dates.length > 0) {
      const games = schedule.data.dates[0].games.filter(game => game.gameType !== constants.AllStarGameType && game.gameType !== constants.PreSeasonGameType);
      for (let n = 0; n < games.length; n += 1) {
        const gamePk = games[n].gamePk;
        console.log(`Beginning game [${gamePk}]`);

        // Fetch data
        const gameEvents = await request(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);
        const gameShifts = await request(`http://www.nhl.com/stats/rest/shiftcharts?cayenneExp=gameId=${gamePk}`);
        const gameSummaries = await request(`https://api.nhle.com/stats/rest/team?reportType=basic&isGame=true&reportName=teamsummary&cayenneExp=gameId=${gamePk}`);

        // Check that the game state is final
        if (gameEvents.data.gameData.status.abstractGameState !== 'Final') {
          throw new Error('Game state not final yet');
        }

        if (gameShifts.data.data.length <= 0) {
          throw new Error('Game shifts not found');
        }

        // Parse data
        let events = [];
        if (gameEvents.data.liveData.plays.allPlays.length > 0) {
          const gamePenalties = parsePenalties(gameEvents, gameShifts);
          const goaliePulls = parseGoaliePulls(gameEvents, gameShifts);
          events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties, goaliePulls);
        } else {
          events = constructLivePlays(gamePk, gameEvents);
        }
        const summaries = parseBoxScores(gamePk, gameEvents, gameSummaries, gameShifts);

        // Write data
        console.log(`Writting [${events.length}] events to db`);

        if (events.length > 0) {
          const promises = [];
          for (let i = 0; i < events.length; i += 1) {
            promises.push(ddb.put({
              TableName: constants.EventsTable,
              Item: events[i],
            }).promise());
          }
          await Promise.all(promises);
        }

        console.log(`Writting [${summaries.length}] summaries to db`);

        if (summaries.length > 0) {
          const promises = [];
          for (let i = 0; i < summaries.length; i += 1) {
            promises.push(ddb.put({
              TableName: constants.SummariesTable,
              Item: summaries[i],
            }).promise());
          }
          await Promise.all(promises);
        }

        console.log(`Finished game [${gamePk}]`);
      }
    }

    // Increment and save the new startIndex
    await ddb.put({
      TableName: constants.IndexesTable,
      Item: {
        id: constants.IndexId,
        startIndex: startIndex.add(1, 'days').format('YYYY-MM-DD'),
      },
    }).promise();

    console.log('Finished crawling for date: ', startIndex.subtract(1, 'days').format('YYYY-MM-DD'));
  } catch (ex) {
    console.log('Ex: ', ex);
  }
};
