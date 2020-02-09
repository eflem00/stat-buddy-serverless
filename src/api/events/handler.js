const db = require('../../common/db');
const logger = require('../../common/logger');

let client = null;

module.exports.get = async () => {
  try {
    if (client === null) {
      logger.info('No cached client found');
      client = await db.connect();
    } else {
      logger.info('Using cached client');
    }

    const Events = client.model('events');

    const count = await Events.countDocuments();

    return {
      statusCode: 200,
      body: JSON.stringify({
        count,
      }),
    };
  } catch (ex) {
    logger.error(ex);
    return {
      statusCode: 500,
      message: 'Internal Server Error',
    };
  }
};
