const timeHelper = require('./timeHelper');
const constants = require('./constants');

function getTeamSummaries(gamePk, gameEvents, gameShifts, teamBoxscore, opposingTeamBoxscore, playerBoxscores) {
  const summaries = [];

  const teamSummary = {
    id: teamBoxscore.teamId,
    dateTime: new Date(teamBoxscore.gameDate),
    gamePk,
    venue: gameEvents.data.gameData.venue.name,
    opposingTeamId: opposingTeamBoxscore.teamId,
    win: opposingTeamBoxscore.losses,
    tie: teamBoxscore.ties,
    loss: teamBoxscore.losses,
    otWin: opposingTeamBoxscore.otLosses,
    otLoss: teamBoxscore.otLosses,
    soWin: teamBoxscore.shootoutGamesWon,
    soLoss: teamBoxscore.shootoutGamesLost,
    points: teamBoxscore.points,
  };

  summaries.push(teamSummary);

  Object.keys(playerBoxscores).forEach(key => {
    const player = playerBoxscores[key];

    if (player.stats.skaterStats || player.stats.goalieStats) {
      const playerSummary = { ...teamSummary };
      playerSummary.teamId = playerSummary.id;
      playerSummary.id = player.person.id;

      if (player.position.type === constants.GoalieType) {
        playerSummary.timeOnIce = timeHelper.timeToInt(player.stats.goalieStats.timeOnIce);
        playerSummary.decision =
          player.stats.goalieStats.decision === '' ? constants.GoalieRelief : player.stats.goalieStats.decision;
        playerSummary.started = false;
        gameShifts.data.data.forEach(gameShift => {
          const startTime = timeHelper.getTotalSeconds(
            gameShift.period,
            gameShift.startTime,
            gameEvents.data.gameData.game.type,
          );
          if (gameShift.playerId === player.person.id && startTime === 0) {
            playerSummary.started = true;
          }
        });
      } else {
        playerSummary.timeOnIce = timeHelper.timeToInt(player.stats.skaterStats.timeOnIce);
        playerSummary.evenTimeOnIce = timeHelper.timeToInt(player.stats.skaterStats.evenTimeOnIce);
        playerSummary.powerPlayTimeOnIce = timeHelper.timeToInt(player.stats.skaterStats.powerPlayTimeOnIce);
        playerSummary.shortHandedTimeOnIce = timeHelper.timeToInt(player.stats.skaterStats.shortHandedTimeOnIce);
      }

      summaries.push(playerSummary);
    }
  });

  return summaries;
}

module.exports = function parseBoxScores(gamePk, gameEvents, gameSummaries, gameShifts) {
  const firstTeamSummary = gameSummaries.data.data[0];
  const secondTeamSummary = gameSummaries.data.data[1];
  const firstTeamBoxscores =
    firstTeamSummary.teamId === gameEvents.data.liveData.boxscore.teams.away.team.id
      ? gameEvents.data.liveData.boxscore.teams.away.players
      : gameEvents.data.liveData.boxscore.teams.home.players;
  const secondTeamBoxscores =
    secondTeamSummary.teamId === gameEvents.data.liveData.boxscore.teams.away.team.id
      ? gameEvents.data.liveData.boxscore.teams.away.players
      : gameEvents.data.liveData.boxscore.teams.home.players;

  const firstSummaries = getTeamSummaries(
    gamePk,
    gameEvents,
    gameShifts,
    firstTeamSummary,
    secondTeamSummary,
    firstTeamBoxscores,
  );

  const secondSummaries = getTeamSummaries(
    gamePk,
    gameEvents,
    gameShifts,
    secondTeamSummary,
    firstTeamSummary,
    secondTeamBoxscores,
  );

  return [...firstSummaries, ...secondSummaries];
};
