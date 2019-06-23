const constants = require('./constants');

function timeToInt(time) {
  let leadMinute;
  let smallMinute;
  let leadSecond;
  let smallSecond;
  if (time.length === 5) {
    leadMinute = Number.parseInt(time[0], 10);
    smallMinute = Number.parseInt(time[1], 10);
    leadSecond = Number.parseInt(time[3], 10);
    smallSecond = Number.parseInt(time[4], 10);
  } else {
    leadMinute = 0;
    smallMinute = Number.parseInt(time[0], 10);
    leadSecond = Number.parseInt(time[2], 10);
    smallSecond = Number.parseInt(time[3], 10);
  }

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
