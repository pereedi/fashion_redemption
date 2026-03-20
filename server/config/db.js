import knex from 'knex';
import knexConfig from '../../knexfile.js';
import { logger } from '../utils/logger.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

// Test connection
db.raw('SELECT 1')
  .then(() => {
    logger.info(`MySQL (${environment}) connected successfully.`);
  })
  .catch((err) => {
    logger.error('MySQL connection failed', { error: err.message });
  });

export default db;
