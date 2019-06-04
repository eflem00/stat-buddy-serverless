const moment = require('moment');
const constants = require('./constants');

function timeToInt(time) {
  const momentTime = moment(time, 'mm:ss');
  return (momentTime.minutes() * 60) + momentTime.seconds();
}


function getTotalSeconds(period, time, gameType) {
  let seconds = timeToInt(time);
  for (let i = 1; i < period; i += 1) {
    if (i < 4 || gameType === constants.PlayoffGameType) {
      seconds += 1200;
    } else {
      seconds += 300;
    }
  }
  return seconds;
}

module.exports.getTotalSeconds = getTotalSeconds;
module.exports.timeToInt = timeToInt;
