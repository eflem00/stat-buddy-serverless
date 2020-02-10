const serverless = require('serverless-http');
const express = require('express');
const sanitizer = require('express-sanitizer');
const cors = require('cors');
const stats = require('./controllers/stats');
const db = require('../common/db');
const logger = require('../common/logger');

let client = null;

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
  if (!client) {
    client = await db.connect();
  }
  res.locals.client = {
    Events: client.model('events'),
    Summaries: client.model('summaries'),
    Profiles: client.model('profiles'),
  };
  next();
});

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.send(200);
});

// Controllers
app.use('/stats', stats);

// Response context
// TODO: This doesn't get hit when res. is called
app.use((req, res, next) => {
  logger.info(`Response: Code [${res.statusCode}] Time [${Date.now() - res.locals.requestTime}]`);
  next();
});

// Error Handler
// TODO: This doesn't get hit when an error is thrown
//       only when next(error) is called
app.use((error, req, res, next) => {
  logger.error(error.message);
  res.status(400).json({ message: 'Invalid Request' });
});

module.exports.app = serverless(app);
