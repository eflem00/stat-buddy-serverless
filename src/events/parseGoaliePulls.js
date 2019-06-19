const timeHelper = require('./timeHelper');

function findGoaliePulls(goalies, gameShifts, teamId, gameType) {
  const goaliePulls = [];
  const goalieShifts = [];
  goalies.forEach(goalieId => {
    gameShifts.forEach(shift => {
      if (shift.playerId === goalieId) {
        const startTime = timeHelper.getTotalSeconds(shift.period, shift.startTime, gameType);
        const endTime = timeHelper.getTotalSeconds(shift.period, shift.endTime, gameType);
        goalieShifts.push({
          startTime,
          endTime,
        });
      }
    });
  });
  goalieShifts.forEach(shift => {
    if (!goalieShifts.some(connectingShift => connectingShift.startTime === shift.endTime)) {
      let lowestStartTime = Number.MAX_SAFE_INTEGER;
      goalieShifts.forEach(lowestShift => {
        if (lowestShift.startTime > shift.endTime && lowestShift.startTime < lowestStartTime) {
          lowestStartTime = lowestShift.startTime;
        }
      });
      if (lowestStartTime < Number.MAX_SAFE_INTEGER) {
        goaliePulls.push({
          startTime: shift.endTime,
          endTime: lowestStartTime,
          teamId,
        });
      }
    }
  });
  return goaliePulls;
}

module.exports = function parseGoaliePulls(gameEvents, gameShifts) {
  // Track goalie shifts to determine delayed penalies / goalie pulls
  const awayGoaliePulls = findGoaliePulls(
    gameEvents.data.liveData.boxscore.teams.away.goalies,
    gameShifts.data.data,
    gameEvents.data.liveData.boxscore.teams.away.team.id,
    gameEvents.data.gameData.game.type,
  );
  const homeGoaliePulls = findGoaliePulls(
    gameEvents.data.liveData.boxscore.teams.home.goalies,
    gameShifts.data.data,
    gameEvents.data.liveData.boxscore.teams.home.team.id,
    gameEvents.data.gameData.game.type,
  );
  return [...awayGoaliePulls, ...homeGoaliePulls];
};
