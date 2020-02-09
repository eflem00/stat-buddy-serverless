const request = require('axios');
const db = require('../common/db');
const logger = require('../common/logger');

let client = null;

module.exports.crawl = async () => {
  try {
    if (client === null) {
      logger.info('No cached client found');
      client = await db.connect();
    } else {
      logger.info('Using cached client');
    }

    const Indexes = client.model('indexes');
    const Profiles = client.model('profiles');

    const profilesIndex = await Indexes.findById('ProfilesIndex');
    const startIndex = Number.parseInt(profilesIndex.index, 10);
    // const startIndex = 20182019;

    logger.info(`Beginning crawl for year: ${startIndex}`);

    const response = await request(`http://statsapi.web.nhl.com/api/v1/teams?expand=team.roster&season=${startIndex}`);
    const teamsData = response.data.teams;
    for (let i = 0; i < teamsData.length; i += 1) {
      const teamData = teamsData[i];
      const team = new Profiles({
        _id: teamData.id,
        name: teamData.name,
        venue: teamData.venue.name,
        city: teamData.venue.city,
        abbreviation: teamData.abbreviation,
        teamName: teamData.teamName,
        locationName: teamData.locationName,
        division: teamData.division.name,
        divisionId: teamData.division.id,
        conference: teamData.conference.name,
        conferenceId: teamData.conference.id,
      });
      await Profiles.findOneAndUpdate({ _id: teamData.id }, team, { upsert: true });

      const roster = teamData.roster.roster;
      const requests = [];
      for (let j = 0; j < roster.length; j += 1) {
        const playerId = roster[j].person.id;
        requests.push(request(`https://statsapi.web.nhl.com/api/v1/people/${playerId}?expand=person`));
      }
      const responses = await Promise.all(requests);
      for (let k = 0; k < responses.length; k += 1) {
        const playerData = responses[k].data.people[0];
        const player = new Profiles({
          _id: playerData.id,
          fullName: playerData.fullName,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          primaryNumber: playerData.primaryNumber,
          birthDate: playerData.birthDate,
          currentage: playerData.currentAge,
          birthCity: playerData.birthCity,
          birthCountry: playerData.birthCountry,
          nationality: playerData.nationality,
          height: playerData.height,
          weight: playerData.weight,
          active: playerData.active,
          alternateCaptain: playerData.alternateCaptain,
          captain: playerData.captain,
          rookie: playerData.rookie,
          shootsCatches: playerData.shootsCatches,
          rosterStatus: playerData.rosterStatus,
        });
        if (playerData.currentTeam) {
          player.currentTeam = {
            id: playerData.currentTeam.id,
            name: playerData.currentTeam.name,
          };
        }
        if (playerData.primaryPosition) {
          player.position = {
            code: playerData.primaryPosition.code,
            name: playerData.primaryPosition.name,
            type: playerData.primaryPosition.type,
          };
        }
        await Profiles.findOneAndUpdate({ _id: playerData.id }, player, { upsert: true });
      }
    }

    logger.info(`Finished crawl for year: ${startIndex}`);

    profilesIndex.index = startIndex + 10001;
    await profilesIndex.save();
  } catch (ex) {
    logger.error(`Ex: ${ex}`);
  }
};
