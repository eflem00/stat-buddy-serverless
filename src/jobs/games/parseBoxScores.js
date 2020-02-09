const timeHelper = require('../../common/timeHelper');
const constants = require('../../common/constants');

function getTeamSummaries(gamePk, gameEvents, gameShifts, teamBoxscore, opposingTeamBoxscore, playerBoxscores) {
  const summaries = [];

  const teamSummary = {
    id: teamBoxscore.teamId,
    dateTime: new Date(teamBoxscore.gameDate),
    gamePk,
    venue: gameEvents.data.gameData.venue.name,
    opposingTeamId: opposingTeamBoxscore.teamId,
    win: opposingTeamBoxscore.losses,
    tie: teamBoxscore.ties ? 1 : 0,
    loss: teamBoxscore.losses,
    otWin: opposingTeamBoxscore.otLosses,
    otLoss: teamBoxscore.otLosses,
    soWin: teamBoxscore.winsInShootout,
    soLoss: opposingTeamBoxscore.winsInShootout,
    points: teamBoxscore.points,
    goalsFor: teamBoxscore.goalsFor,
    goalsAgainst: teamBoxscore.goalsAgainst,
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
        if (player.stats.goalieStats.decision !== '') {
          playerSummary.decision = player.stats.goalieStats.decision === constants.GoalieWin ? 1 : 0;
        }
        playerSummary.started = 0;
        gameShifts.data.data.forEach(gameShift => {
          const startTime = timeHelper.getTotalSeconds(
            gameShift.period,
            gameShift.startTime,
            gameEvents.data.gameData.game.type,
          );
          if (gameShift.playerId === player.person.id && startTime === 0) {
            playerSummary.started = 1;
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
