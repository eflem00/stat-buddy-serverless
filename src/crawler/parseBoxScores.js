const timeHelper = require('./timeHelper');

function getTeamSummaries(gamePk, gameEvents, teamBoxscore, opposingTeamBoxscore, playerBoxscores) {
  const summaries = [];

  const teamSummary = {
    id: teamBoxscore.teamId,
    dateTime: teamBoxscore.gameDate,
    gamePk,
    gameType: gameEvents.data.gameData.game.type,
    gameSeason: parseInt(gameEvents.data.gameData.game.season, 10),
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

  Object.keys(playerBoxscores).forEach((key) => {
    const playerId = playerBoxscores[key].person.id;
    const player = playerBoxscores[key].stats.skaterStats;
    const playerSummary = { ...teamSummary };
    playerSummary.id = playerId;
    playerSummary.timeOnIce = player !== undefined ? timeHelper.timeToInt(player.timeOnIce) : 0;
    playerSummary.evenTimeOnIce = player !== undefined ? timeHelper.timeToInt(player.evenTimeOnIce) : 0;
    playerSummary.powerPlayTimeOnIce = player !== undefined ? timeHelper.timeToInt(player.powerPlayTimeOnIce) : 0;
    playerSummary.shortHandedTimeOnIce = player !== undefined ? timeHelper.timeToInt(player.shortHandedTimeOnIce) : 0;
    summaries.push(playerSummary);
  });

  return summaries;
}

module.exports = function parseBoxScores(gamePk, gameEvents, gameSummaries) {
  const firstTeamSummary = gameSummaries.data.data[0];
  const secondTeamSummary = gameSummaries.data.data[1];
  const firstTeamBoxscores = firstTeamSummary.teamId === gameEvents.data.liveData.boxscore.teams.away.team.id
    ? gameEvents.data.liveData.boxscore.teams.away.players
    : gameEvents.data.liveData.boxscore.teams.home.players;
  const secondTeamBoxscores = secondTeamSummary.teamId === gameEvents.data.liveData.boxscore.teams.away.team.id
    ? gameEvents.data.liveData.boxscore.teams.away.players
    : gameEvents.data.liveData.boxscore.teams.home.players;

  const firstSummaries = getTeamSummaries(
    gamePk,
    gameEvents,
    firstTeamSummary,
    secondTeamSummary,
    firstTeamBoxscores,
  );

  const secondSummaries = getTeamSummaries(
    gamePk,
    gameEvents,
    secondTeamSummary,
    firstTeamSummary,
    secondTeamBoxscores,
  );

  return [...firstSummaries, ...secondSummaries];
};
