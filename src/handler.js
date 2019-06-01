const request = require('axios');
const moment = require('moment');
const aws = require('aws-sdk');
const parseLivePlays = require('./parseLivePlays');
const constructLivePlays = require('./constructLivePlays');

aws.config.update({ region: process.env.REGION });
const ddb = new aws.DynamoDB.DocumentClient();

module.exports.crawl = async () => {
  try {
    // Get the start index
    const response = await ddb.get({
      TableName: process.env.START_INDEX_TABLE,
      Key: {
        id: process.env.START_INDEX_ID,
      },
    }).promise();
    const startIndex = response.Item.startIndex ? moment(response.Item.startIndex) : moment('2010-10-07');
    const badGames = response.Item.badGames ? response.Item.badGames : [];

    // const startIndex = moment('2018-02-23'); // This one has an empty plays array
    // const badGames = [];

    console.log('Beginning crawl for date: ', startIndex.format('YYYY-MM-DD'));

    // Get the games for the given startIndex
    const schedule = await request(`https://statsapi.web.nhl.com/api/v1/schedule?date=${startIndex.format('YYYY-MM-DD')}`);
    if (schedule.data.dates.length > 0) {
      for (const index in schedule.data.dates[0].games) {
        if (schedule.data.dates[0].games[index] !== undefined) {
          // Get the events for a given gamse
          const gamePk = schedule.data.dates[0].games[index].gamePk;

          console.log(`Beginning game [${gamePk}]`);

          const gameEvents = await request(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);
          const gameShifts = await request(`http://www.nhl.com/stats/rest/shiftcharts?cayenneExp=gameId=${gamePk}`);

          // Check that the game state is final
          if (gameEvents.data.gameData.status.abstractGameState !== 'Final') {
            throw new Error('Game state not final yet');
          }

          // Some games are missing shifts...
          if (gameShifts.data.data.length === 0) {
            console.log(`No shift data found... [${gamePk}]`);
            badGames.push(gamePk);
          }

          // Some games are missing plays...
          let events = [];
          if (gameEvents.data.liveData.plays.allPlays.length > 0) {
            events = parseLivePlays(gamePk, gameEvents, gameShifts);
          } else {
            events = constructLivePlays(gamePk, gameEvents);
          }

          console.log(`Found [${events.length}] events for game [${gamePk}]`);

          let promises = [];
          for (let i = 0; i < events.length; i++) {
            promises.push(ddb.put({
              TableName: 'events',
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
      TableName: process.env.START_INDEX_TABLE,
      Item: {
        id: process.env.START_INDEX_ID,
        startIndex: startIndex.add(1, 'days').format('YYYY-MM-DD'),
        badGames,
      },
    }).promise();

    console.log('Finished crawling for date: ', startIndex.format('YYYY-MM-DD'));
  } catch (ex) {
    console.log('Error Crawling APIs. Ex: ', ex);
  }
};


          // if (events.length > 0) {
          //   let batch = [];
          //   batch.push({
          //     PutRequest: {
          //       Item: events[0],
          //     },
          //   });
          //   const params = {
          //     RequestItems: {
          //       'events': batch,
          //     },
          //   };
          //   ddb.batchWrite(params, (err, data) => {
          //     if (err) console.log(err);
          //     else console.log(data);
          //   });
          // }

          // for (let i = 0; i < events.length; i += 1) {
          //   let batch = [];
          //   batch.push({
          //     PutRequest: {
          //       Item: events[i],
          //     },
          //   });
          //   if (batch.length === 25) {
          //     const params = {
          //       RequestItems: {
          //         'events': [...batch],
          //       },
          //     };
          //     await ddb.batchWrite(params).promise();
          //     batch = [];
          //   }
          // }
