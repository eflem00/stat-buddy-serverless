const timeHelper = require('./timeHelper');

module.exports = function parsePenalties(gameEvents) {
  const penalties = [];

  gameEvents.data.liveData.plays.allPlays.forEach((play) => {
    if (play.result.eventTypeId === 'PENALTY' && play.result.secondaryType !== 'Fighting') {
      const startTime = timeHelper.getTotalSeconds(play.about.period, play.about.periodTime);
      const endTime = startTime + play.result.penaltyMinutes * 60;
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
