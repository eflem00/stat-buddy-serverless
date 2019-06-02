const request = require('axios');
const moment = require('moment');
const aws = require('aws-sdk');
const parseLivePlays = require('./parseLivePlays');
const constructLivePlays = require('./constructLivePlays');
const parsePenalties = require('./parsePenalties');
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
    const startIndex = response.Item.startIndex ? moment(response.Item.startIndex) : moment('2010-10-07');

    // const startIndex = moment('2018-02-23'); // This one has an empty plays array

    console.log('Beginning crawl for date: ', startIndex.format('YYYY-MM-DD'));

    // Get the games for the given startIndex
    const schedule = await request(`https://statsapi.web.nhl.com/api/v1/schedule?date=${startIndex.format('YYYY-MM-DD')}`);
    if (schedule.data.dates.length > 0) {
      for (const index in schedule.data.dates[0].games) {
        if (schedule.data.dates[0].games[index] !== undefined) {
          const gamePk = schedule.data.dates[0].games[index].gamePk;
          console.log(`Beginning game [${gamePk}]`);

          const gameEvents = await request(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);
          const gameShifts = await request(`http://www.nhl.com/stats/rest/shiftcharts?cayenneExp=gameId=${gamePk}`);

          // Check that the game state is final
          if (gameEvents.data.gameData.status.abstractGameState !== 'Final') {
            throw new Error('Game state not final yet');
          }

          let events = [];
          if (gameEvents.data.liveData.plays.allPlays.length > 0) {
            const gamePenalties = parsePenalties(gameEvents);
            events = parseLivePlays(gamePk, gameEvents, gameShifts, gamePenalties);
          } else {
            events = constructLivePlays(gamePk, gameEvents);
          }

          console.log(`Writting [${events.length}] events to db`);

          const promises = [];
          for (let i = 0; i < events.length; i += 1) {
            promises.push(ddb.put({
              TableName: constants.EventsTable,
              Item: events[i],
            }).promise());
          }
          await Promise.all(promises);

          console.log(`Finished game [${gamePk}]`);
        }
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

    console.log('Finished crawling for date: ', startIndex.format('YYYY-MM-DD'));
  } catch (ex) {
    console.log('Ex: ', ex);
  }
};
