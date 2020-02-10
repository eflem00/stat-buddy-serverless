const express = require('express');

const router = express.Router();

router.get('/count', async (req, res) => {
  const { Events } = res.locals.client;

  const count = await Events.countDocuments();

  res.status(200).json({ count });
});

module.exports = router;
