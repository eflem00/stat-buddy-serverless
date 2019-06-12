const constants = require('./constants');

function timeToInt(time) {
  const leadMinute = Number.parseInt(time[0], 10);
  const smallMinute = Number.parseInt(time[1], 10);
  const leadSecond = Number.parseInt(time[3], 10);
  const smallSecond = Number.parseInt(time[4], 10);

  return leadMinute * 600 + smallMinute * 60 + leadSecond * 10 + smallSecond;
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
