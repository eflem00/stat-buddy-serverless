const express = require('express');
const logger = require('../../common/logger');

const router = express.Router();

router.get('/count', async (req, res, next) => {
  try {
    const { Events } = req.app.locals.client;

    const count = await Events.countDocuments();

    res.status(200).json({ count });
    next();
  } catch (ex) {
    logger.error('Exception in GET /count');
    next(ex);
  }
});

module.exports = router;
