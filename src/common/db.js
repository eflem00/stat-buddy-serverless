const mongoose = require('mongoose');

module.exports.connect = async () => {
  try {
    const connString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_TARGET}?retryWrites=true&w=majority`;
    mongoose.connect(connString);

    console.log('Connected to db');

    return await mongoose.connection;
  } catch (ex) {
    console.log('Exception encountered when attempting to establish connection');
    throw new Error(ex);
  }
};

module.exports.disconnect = () => {
  try {
    mongoose.disconnect();
  } catch (ex) {
    console.log('Exception encountered when attempting to close connection');
    throw new Error(ex);
  }
};

module.exports.events = db => {
  const Schema = mongoose.Schema;

  const Event = new Schema({
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

  let events;
  if (db.models.events) {
    events = db.models.events;
  } else {
    events = db.model('events', Event);
  }

  return events;
};

module.exports.indexes = db => {
  const Schema = mongoose.Schema;

  const Index = new Schema({
    _id: { type: String, required: true },
    index: { type: String, required: true },
    badGames: { type: Array, required: true },
  });

  let indexes;
  if (db.models.indexes) {
    indexes = db.models.indexes;
  } else {
    indexes = db.model('indexes', Index);
  }

  return indexes;
};

module.exports.summaries = db => {
  const Schema = mongoose.Schema;

  const Summary = new Schema({
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

  let summaries;
  if (db.models.summaries) {
    summaries = db.models.summaries;
  } else {
    summaries = db.model('summaries', Summary);
  }

  return summaries;
};
