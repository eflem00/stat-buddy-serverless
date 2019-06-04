const moment = require('moment');


function timeToInt(time) {
  const momentTime = moment(time, 'mm:ss');
  return (momentTime.minutes() * 60) + momentTime.seconds();
}


function getTotalSeconds(period, time) {
  // TODO: OT not always 20 minutes...
  let seconds = timeToInt(time);
  for (let i = 1; i < period; i += 1) {
    seconds += 1200;
  }
  return seconds;
}

module.exports.getTotalSeconds = getTotalSeconds;
module.exports.timeToInt = timeToInt;
