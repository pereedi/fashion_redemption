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
    logger.error('MySQL connection failed', { 
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      details: environment === 'production' ? 'Check your MYSQL_HOST/DATABASE_URL and SSL settings in Render.' : 'Is your local MySQL server running?'
    });
  });

export default db;
