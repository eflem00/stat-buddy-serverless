const mongoose = require('mongoose');

module.exports.connect = async () => {
  try {
    mongoose.connect(process.env.CONNECTION_STRING);

    console.log('connected to db...');

    return await mongoose.connection;
  } catch (ex) {
    console.log('exception encountered when attempting to establish connection');
    throw new Error(ex);
  }
};

module.exports.event = (db) => {
  const Schema = mongoose.Schema;

  const Event = new Schema({
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

  return db.model('events', Event);
};
