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

// Request Logger
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(400).json({ message: 'Invalid Request' });
});

// Db client init
app.use(async (req, res, next) => {
  if (client === null) {
    logger.info('No cached client found');
    client = await db.connect();
  } else {
    logger.info('Using cached client');
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

module.exports.app = serverless(app);
