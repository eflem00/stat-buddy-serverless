'use strict';

const request = require('axios');
const moment = require('moment');

const elasticsearch = require('elasticsearch');
const es = require('elasticsearch').Client({
  hosts: process.env.ES_URL,
  connectionClass: require('http-aws-es'),
  amazonES: {
      region: process.env.REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const aws = require('aws-sdk');
aws.config.update({region: process.env.REGION});
const ddb = new aws.DynamoDB();

module.exports.crawl = async () => {
  try{
    //Get the start index
    const response = await ddb.getItem({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {id: process.env.START_INDEX_ID}
    }).promise();
    const startIndex = moment(response.items[0].startIndex);

    console.log('Beginning crawl for date: ', startIndex.format('YYYY-MM-DD'));

    // Get the games for the given startIndex
    const schedule = await request(`https://statsapi.web.nhl.com/api/v1/schedule?date=${startIndex.format('YYYY-MM-DD')}`);
    if(schedule.data.dates.length > 0) {
      for(const index in schedule.data.dates[0].games){

        // Get the events for a given game
        const gamePk = schedule.data.dates[0].games[index].gamePk;
        const response = await request(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);

        // Check that the game state is final
        if(response.data.gameData.status.abstractGameState !== 'Final')
          throw 'game state not final yet!';
      
        // Parse the game data
        const events = parseEvents(response, gamePk)

        // Insert the events in elastic search
        const bulkResponse = await es.bulk({ body: events });

        // Check for errors
        let errorCount = 0;
        bulkResponse.items.forEach(item => {
          if (item.index && item.index.error) {
            console.log(++errorCount, item.index.error);
          }
        });
        console.log(`Successfully indexed [${events.length - errorCount}/${events.length}] events for Game Id [${gamePk}]`);
        if(errorCount > 0)
          throw 'errors found in bulk response';
      }
    }

    // Increment and save the new startIndex
    startIndex.add(1, 'days');
    await ddb.putItem({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id : {S: 'CrawlerIndex'},
        startIndex : {S: startIndex.format('YYYY-MM-DD')}
      }
    }).promise();

    console.log('Finished crawling for date: ', startIndex.format('YYYY-MM-DD'));
  } catch(ex) {
    console.log(`Error Crawling APIs. Ex: `, ex);
  }
};

function parseEvents(response, gamePk) {
  const events = [];

  const gameData = {
    game_pk: gamePk,
    game_type: response.data.gameData.game.type,
    game_season: response.data.gameData.game.season,
    game_start_date: response.data.gameData.datetime.dateTime,
    game_end_date: response.data.gameData.datetime.endDateTime,
    away_team: response.data.gameData.teams.away.id,
    home_team: response.data.gameData.teams.home.id,
    venue: response.data.gameData.venue.name
  };

  response.data.liveData.plays.allPlays.forEach((play) => {
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
  
    let players =  [];
    if(play.players !== undefined){
      players = play.players.map(player => {
        return {
          player_id: player.player.id,
          player_type: player.playerType
        };
      });
    }
    doc.players = players;
    events.push({ index: {_index: 'events', _type: 'event', _id: gamePk.toString() + play.about.eventIdx.toString()}});
    events.push(doc);
  });

  return events;
}
