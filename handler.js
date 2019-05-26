'use strict';

const request = require('axios');
const moment = require('moment');

const es = require('elasticsearch').Client({
  hosts: process.env.ES_URL,
  connectionClass: require('http-aws-es'),
  amazonES: {
      region: process.env.REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// const aws = require('aws-sdk');
// aws.config.update({region: process.env.REGION});
// const ddb = new aws.DynamoDB.DocumentClient();

module.exports.crawl = async (event, context, callback) => {
  try{
    //Get the start index
    // const response = await ddb.get({
    //   TableName : process.env.DYNAMODB_TABLE,
    //   Key: {
    //     id: process.env.START_INDEX_ID
    //   }
    // }).promise();
    // const startIndex = response.Item.startIndex ? moment(response.Item.startIndex) : moment('2007-09-29');
    // const badGames = response.Item.badGames ? response.Item.badGames : [];
    // const bulkErrors = response.Item.bulkErrors ? response.Item.bulkErrors : [];

    const startIndex = moment('2011-01-01');
    const badGames = [];
    const bulkErrors = [];

    if(startIndex >= moment().subtract(2, 'days'))
      throw 'Start index can not be greater than two days ago...';

    console.log('Beginning crawl for date: ', startIndex.format('YYYY-MM-DD'));

    // Get the games for the given startIndex
    const schedule = await request(`https://statsapi.web.nhl.com/api/v1/schedule?date=${startIndex.format('YYYY-MM-DD')}`);
    if(schedule.data.dates.length > 0) {
      for(const index in schedule.data.dates[0].games){

        // Get the events for a given gamse
        const gamePk = schedule.data.dates[0].games[index].gamePk;
        const gameEvents = await request(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);
        const gameShifts = await request(`http://www.nhl.com/stats/rest/shiftcharts?cayenneExp=gameId=${gamePk}`);

        // Check that the game state is final
        if(gameEvents.data.gameData.status.abstractGameState !== 'Final')
           throw 'Game state not final yet';

        // Some games are missing events???
        if(gameEvents.data.liveData.plays.allPlays.length === 0 || gameShifts.data.data.length === 0)
        {
          console.log(`Bad game found... [${gamePk}]`);
          badGames.push(gamePk);
          continue;
        }

        // Parse the game data
        const events = parseData(gamePk, gameEvents, gameShifts);

        // Insert the events in elastic search
        const bulkResponse = await es.bulk({ body: events });

        // Check for errors
        parseBulkResponse(bulkResponse, bulkErrors, events.length, gamePk);
      }
    }

    // Increment and save the new startIndex
    // startIndex.add(1, 'days');
    // await ddb.put({
    //   TableName : process.env.DYNAMODB_TABLE,
    //   Item: {
    //      id: process.env.START_INDEX_ID,
    //      startIndex: startIndex.format('YYYY-MM-DD'),
    //      badGames,
    //      bulkErrors,
    //   }
    // }).promise();

    console.log('Finished crawling for date: ', startIndex.format('YYYY-MM-DD'));
  } catch(ex) {
    console.log(`Error Crawling APIs. Ex: `, ex);
  }
};

function parseData(gamePk, gameEvents, gameShifts) {
  const events = [];

  const gameData = {
    game_pk: gamePk,
    game_type: gameEvents.data.gameData.game.type,
    game_season: gameEvents.data.gameData.game.season,
    game_start_date: gameEvents.data.gameData.datetime.dateTime,
    game_end_date: gameEvents.data.gameData.datetime.endDateTime,
    away_team: gameEvents.data.gameData.teams.away.id,
    home_team: gameEvents.data.gameData.teams.home.id,
    venue: gameEvents.data.gameData.venue.name
  };

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    const doc = {...gameData};

    if(play.result !== undefined){
      doc.event_type_id = play.result.eventTypeId;
      doc.event_code = play.result.eventCode;
      doc.event = play.result.event;
    }
  
    if(play.about !== undefined){
      doc.event_idx = play.about.eventIdx;
      doc.event_id = play.about.eventId;
      doc.period = play.about.period;
      doc.period_type = play.about.periodType;
      doc.ordinal_num = play.about.ordinalNum;
      doc.period_time = play.about.periodTime;
      doc.period_time_remaining = play.about.periodTimeRemaining;
      doc.date_time = play.about.dateTime;
      doc.away_goals = play.about.goals.away;
      doc.home_goals = play.about.goals.home;
    }
  
    if(play.coordinates !== undefined){
      doc.x = play.coordinates.x;
      doc.y = play.coordinates.y;
    }
  
    if(play.team !== undefined){
      doc.team_id = play.team.id;
    }
  
    //Players on ice for event
    let players =  [];
    if(play.players !== undefined){
      players = play.players.map(player => {
        return {
          player_id: player.player.id,
          player_type: player.playerType,
          player_handedness: gameEvents.data.gameData.players['ID' + player.player.id].shootsCatches
        };
      });
    }
    gameShifts.data.data.forEach(gameShift => {
      const startTime = moment(gameShift.startTime, 'mm:ss');
      const endTime = moment(gameShift.endTime, 'mm:ss');
      const playTime = moment(play.about.periodTime, 'mm:ss');
      const playerAlreadyAdded = players.some(player => player.player_id === gameShift.playerId);

      // Two scenarios:
      //    1) the time of the event is 00:00 so we want to include those who started there shift at this time
      //    2) the time of the event is something else so we don't want to include those who started there shift at this time because for instance a goal was scored, the event is already over and a new unit has come out to play
      if(!playerAlreadyAdded && 
        gameShift.period === play.about.period && (
          (playTime > startTime && playTime <= endTime) ||
          (moment('00:00', 'mm:ss').isSame(playTime) && playTime >= startTime && playTime <= endTime))
      ){
        players.push({
          player_id: gameShift.playerId,
          player_type: 'OnIce'
        });
      }
    });
    doc.players = players;

    //Add records to array
    events.push({ index: {_index: 'events2', _type: 'event', _id: gamePk.toString() + play.about.eventIdx.toString()}});
    events.push(doc);
  });

  return events;
}

function parseBulkResponse(bulkResponse, bulkErrors, eventsLength, gamePk){
  let errorCount = 0;
  bulkResponse.items.forEach(item => {
    if (item.index && item.index.error) {
      console.log(++errorCount, item.index.error);
    }
  });
  console.log(`Successfully indexed [${eventsLength - errorCount}/${eventsLength}] events for Game Id [${gamePk}]`);
  if(errorCount > 0)
    bulkErrors.push(startIndex.format('YYYY-MM-DD'));
}
