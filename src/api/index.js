const serverless = require('serverless-http');
const express = require('express');
const sanitizer = require('express-sanitizer');
const cors = require('cors');
const stats = require('./controllers/stats');
const db = require('../common/db');
const logger = require('../common/logger');

let connection = null;

const app = express();

// Common
app.use(express.json());
app.use(sanitizer());
app.use(cors());

// Request context
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  res.locals.requestTime = Date.now();
  next();
});

// Db client init
app.use(async (req, res, next) => {
  if (!connection) {
    connection = await db.connect();
    app.locals.client = {
      connection,
      Events: connection.model('events'),
      Summaries: connection.model('summaries'),
      Profiles: connection.model('profiles'),
    };
  }
  next();
});

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.send(200);
});

// Controllers
app.use('/stats', stats);

// Response context
app.use((req, res, next) => {
  logger.info(`Response: Code [${res.statusCode}] Time [${Date.now() - res.locals.requestTime}]`);
  next();
});

// Error Handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  logger.error(error.message);
  res.status(400).json({ message: 'Invalid Request' });
});

module.exports.app = serverless(app);
