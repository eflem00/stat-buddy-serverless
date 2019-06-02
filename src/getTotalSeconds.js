const moment = require('moment');

module.exports = function getTotalSeconds(period, time) {
  // TODO: OT not always 20 minutes...
  const momentTime = moment(time, 'mm:ss');
  let seconds = (momentTime.minutes() * 60) + momentTime.seconds();
  for (let i = 1; i < period; i += 1) {
    seconds += 1200;
  }
  return seconds;
};
