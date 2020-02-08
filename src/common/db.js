const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./logger');

const events = () => {
  const client = mongoose.connection;

  const Event = new mongoose.Schema({
    playerId: { type: Number, required: true },
    eventTypeId: { type: String, required: true },
    dateTime: { type: Date, required: true },
    playTime: { type: Number, required: true },
    teamId: { type: Number, required: true },
    teamStatus: { type: String, required: true },
    teamScore: { type: String },
    opposingTeamId: { type: Number, required: true },
    opposingTeamScore: { type: String },
    teamStrength: { type: Number, required: true },
    opposingStrength: { type: Number, required: true },
    players: { type: Array },
    opposingPlayers: { type: Array },
    gamePk: { type: Number, required: true },
    handedness: { type: String },
    x: { type: Number },
    y: { type: Number },
    gameWinningGoal: { type: Boolean },
    emptyNet: { type: Boolean },
    secondaryType: { type: String },
    penaltySeverity: { type: String },
    penaltyMinutes: { type: Number },
  });

  if (client.models.events) {
    return client.models.events;
  }
  return client.model('events', Event);
};

const indexes = () => {
  const client = mongoose.connection;

  const Index = new mongoose.Schema({
    _id: { type: String, required: true },
    index: { type: String, required: true },
    badGames: { type: Array, required: true },
  });

  if (client.models.indexes) {
    return client.models.indexes;
  }
  return client.model('indexes', Index);
};

const summaries = () => {
  const client = mongoose.connection;

  const Summary = new mongoose.Schema({
    id: { type: Number, required: true },
    dateTime: { type: Date, required: true },
    gamePk: { type: Number, required: true },
    venue: { type: String, required: true },
    opposingTeamId: { type: Number, required: true },
    win: { type: Number, required: true },
    tie: { type: Number, required: true },
    loss: { type: Number, required: true },
    otWin: { type: Number, required: true },
    otLoss: { type: Number, required: true },
    soWin: { type: Number, required: true },
    soLoss: { type: Number, required: true },
    points: { type: Number, required: true },
    goalsFor: { type: Number, required: true },
    goalsAgainst: { type: Number, required: true },
    teamId: { type: Number },
    timeOnIce: { type: Number },
    evenTimeOnIce: { type: Number },
    powerPlayTimeOnIce: { type: Number },
    shortHandedTimeOnIce: { type: Number },
    decision: { type: Number },
    started: { type: Number },
  });

  if (client.models.summaries) {
    return client.models.summaries;
  }
  return client.model('summaries', Summary);
};

const profiles = () => {
  const client = mongoose.connection;

  const Profile = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String },
    abbreviation: { type: String },
    teamname: { type: String },
    shortName: { type: String },
    venue: { type: String },
    city: { type: String },
    locationName: { type: String },
    division: { type: String },
    divisionId: { type: Number },
    conference: { type: String },
    conferenceId: { type: Number },
    fullName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    primaryNumber: { type: String },
    birthDate: { type: String },
    currentAge: { type: String },
    birthCity: { type: String },
    birthCountry: { type: String },
    nationality: { type: String },
    height: { type: String },
    weight: { type: String },
    active: { type: String },
    alternateCaptain: { type: String },
    captain: { type: String },
    rookie: { type: String },
    shootsCatches: { type: String },
    rosterStatus: { type: String },
    currentTeamId: { type: Number },
    currentTeamName: { type: String },
    position: { type: String },
    type: { type: String },
  });

  if (client.models.profiles) {
    return client.models.profiles;
  }
  return client.model('profiles', Profile);
};

const connect = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }

    logger.info('Connecting to db');

    const connString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_TARGET}?retryWrites=true&w=majority`;
    await mongoose.connect(connString, { useFindAndModify: false, useNewUrlParser: true });

    logger.info('Fetching models');

    return {
      indexes: indexes(),
      events: events(),
      summaries: summaries(),
      profiles: profiles(),
    };
  } catch (ex) {
    logger.error(`Exception encountered when attempting to establish connection: ${ex.message}`);
    throw ex;
  }
};

const disconnect = async () => {
  try {
    logger.info('Disconnecting from db');
    await mongoose.disconnect();
  } catch (ex) {
    logger.error(`Exception encountered when attempting to close connection: ${ex.message}`);
    throw ex;
  }
};

module.exports = {
  connect,
  disconnect,
};
