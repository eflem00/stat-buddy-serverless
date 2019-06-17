const request = require('axios');
const moment = require('moment');
const dotenv = require('dotenv');
const parseLivePlays = require('./parseLivePlays');
const constructLivePlays = require('./constructLivePlays');
const parsePenalties = require('./parsePenalties');
const parseBoxScores = require('./parseBoxScores');
const parseGoaliePulls = require('./parseGoaliePulls');
const constants = require('./constants');
const dbHelper = require('../common/db');

module.exports.crawl = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }

    // Establish db connection and models
    const db = await dbHelper.connect();
    const Events = dbHelper.events(db);
    const Indexes = dbHelper.indexes(db);
    const Summaries = dbHelper.summaries(db);

    const eventsIndex = await Indexes.findById('EventsIndex');
    const startIndex = moment(eventsIndex.index);
    // const startIndex = moment('2018-02-23');

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

        // Validate data
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
        await Events.insertMany(events);

        console.log(`Writting [${summaries.length}] summaries to db`);
        await Summaries.insertMany(summaries);

        console.log(`Finished game [${gamePk}]`);
      }
    }

    // Increment and save the new startIndex
    eventsIndex.index = startIndex.add(1, 'days').format('YYYY-MM-DD');
    await eventsIndex.save();

    console.log('Finished crawling for date: ', startIndex.subtract(1, 'days').format('YYYY-MM-DD'));
  } catch (ex) {
    console.log('Ex: ', ex);
  }
};
