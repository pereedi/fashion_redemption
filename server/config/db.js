import knex from 'knex';
import knexConfig from '../../knexfile.js';
import { logger } from '../utils/logger.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

// Test connection — non-fatal: a slow/failed DB connection at startup
// should NOT prevent the Node process from binding to its port.
// Passenger will mark the spawn as timed-out if the process doesn't start.
(async () => {
  try {
    await db.raw('SELECT 1');
    logger.info(`MySQL (${environment}) connected successfully.`);
  } catch (err) {
    logger.error('MySQL connection failed — server will still start', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState
    });
  }
})();

export default db;
