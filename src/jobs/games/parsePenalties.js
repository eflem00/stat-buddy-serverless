const timeHelper = require('../../common/timeHelper');
const constants = require('../../common/constants');

module.exports = function parsePenalties(gameEvents) {
  const penalties = [];

  const gameData = gameEvents.data.gameData.game;
  const goalTimes = [];
  gameEvents.data.liveData.plays.allPlays.forEach(play => {
    if (play.result.eventTypeId === constants.Goal) {
      const goalTime = timeHelper.getTotalSeconds(play.about.period, play.about.periodTime, gameData.type);
      goalTimes.push({
        time: goalTime,
        teamId: play.team.id,
      });
    }
  });

  const goalsAlreadyCounted = new Set();
  gameEvents.data.liveData.plays.allPlays.forEach(play => {
    if (
      play.result.eventTypeId === constants.Penalty &&
      play.result.secondaryType !== constants.FightingPenaltyType &&
      play.result.penaltyMinutes > 0 &&
      play.result.penaltyMinutes <= 5
    ) {
      const startTime = timeHelper.getTotalSeconds(play.about.period, play.about.periodTime, gameData.type);
      let endTime = startTime + play.result.penaltyMinutes * 60;

      if (play.result.penaltyMinutes < 5) {
        goalTimes.forEach(goal => {
          if (
            !goalsAlreadyCounted.has(goal.time) &&
            goal.time > startTime &&
            goal.time < endTime &&
            play.team.id !== goal.teamId
          ) {
            if (endTime - goal.time < 120) {
              endTime = goal.time;
            } else {
              endTime = goal.time + 120;
            }
            goalsAlreadyCounted.add(goal.time);
          }
        });
      }

      const teamId = play.team.id;
      penalties.push({
        startTime,
        endTime,
        teamId,
      });
    }
  });

  return penalties;
};
