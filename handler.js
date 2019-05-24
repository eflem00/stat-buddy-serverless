'use strict';

const request = require('axios');
const moment = require('moment');

const elasticsearch = require('elasticsearch');
const es = new elasticsearch.Client({host: 'localhost:9200'});

// const aws = require('aws-sdk');
// AWS.config.update({region: 'us-west-2'});
// const ddb = new aws.DynamoDB();

const _index = 'events';
const _type = 'event';

module.exports.crawl = async (event, context, callback) => {
  try{

    // Get the start index
    // const eventsIndex = await ddb.getItem({
    //   TableName: 'CRAWL_INDEXES',
    //   Key: {'INDEX_NAME': {S: 'EVENT_INDEX'}}
    // });
    // const startIndex = moment(eventsIndex);
    const startIndex = moment('2017-01-03');
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
        const events = [];
        const gameData = {
          game_pk: gamePk,
          game_type: response.data.gameData.game.type,
          game_season: response.data.gameData.game.season,
          game_date: response.data.gameData.dateTime,
          away_team: response.data.gameData.teams.away.id,
          home_team: response.data.gameData.teams.home.id,
          venue: response.data.gameData.venue.name
        };
        response.data.liveData.plays.allPlays.forEach((play) => {
          const _id = gamePk.toString() + play.about.eventId.toString();
          const doc = buildDoc(play, gameData);
          events.push({ index: {_index, _type, _id}});
          events.push(doc);
        });

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
    // startIndex.add(1, 'days');
    // await ddb.putItem({
    //   TableName: 'CRAWL_INDEXES',
    //   Item: {
    //     'INDEX_NAME' : {S: 'EVENT_INDEX'},
    //     'DATE' : {S: startIndex.format('YYYY-MM-DD')}
    //   }
    // });

    console.log('Finished crawling for date: ', startIndex.format('YYYY-MM-DD'));
  } catch(ex) {
    console.log(`Error Crawling APIs. Ex: `, ex);
  }
};

function buildDoc(play, gameData) {
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

  return doc;
}
