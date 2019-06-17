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

module.exports.events = (db) => {
  const Schema = mongoose.Schema;

  const Event = new Schema({
    _id: { type: Object },
    gamePk: { type: Number },
    gameType: { type: String },
    gameSeason: { type: Number },
    venue: { type: String },
    eventTypeId: { type: String },
    dateTime: { type: Date },
    playTime: { type: Number },
    teamId: { type: Number },
    teamStatus: { type: String },
    teamScore: { type: String },
    opposingTeamId: { type: Number },
    opposingTeamScore: { type: String },
    x: { type: Number },
    y: { type: Number },
    teamStrength: { type: Number },
    opposingStrength: { type: Number },
    players: { type: Array },
    opposingPlayers: { type: Array },
    playerId: { type: Number },
    handedness: { type: String },
  });

  let events;
  if (db.models.events) {
    events = db.models.events;
  } else {
    events = db.model('events', Event);
  }

  return events;
};

module.exports.indexes = (db) => {
  const Schema = mongoose.Schema;

  const Index = new Schema({
    _id: { type: String },
    index: { type: String },
  });

  let indexes;
  if (db.models.indexes) {
    indexes = db.models.indexes;
  } else {
    indexes = db.model('indexes', Index);
  }

  return indexes;
};

module.exports.summaries = (db) => {
  const Schema = mongoose.Schema;

  const Summary = new Schema({
    _id: { type: Object },
    dateTime: { type: Date },
    gamePk: { type: Number },
    gameType: { type: String },
    gameSeason: { type: Number },
    venue: { type: String },
    opposingTeamId: { type: Number },
    win: { type: Number },
    tie: { type: Number },
    loss: { type: Number },
    otWin: { type: Number },
    otLoss: { type: Number },
    soWin: { type: Number },
    soLoss: { type: Number },
    points: { type: Number },
    teamId: { type: Number },
    timeOnIce: { type: Number },
    evenTimeOnIce: { type: Number },
    powerPlayTimeOnIce: { type: Number },
    shortHandedTimeOnIce: { type: Number },
  });

  let summaries;
  if (db.models.summaries) {
    summaries = db.models.summaries;
  } else {
    summaries = db.model('summaries', Summary);
  }

  return summaries;
};
