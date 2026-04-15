import dotenv from 'dotenv';
dotenv.config();

const sanitizeParam = (param) => {
  if (!param) return param;
  if (typeof param !== 'string') return param;
  // Remove all whitespace, newlines, and carriage returns
  let clean = param.trim().replace(/[\n\r]/g, '');
  // Specifically for hosts: remove http:// or https:// and trailing slashes
  clean = clean.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return clean;
};

const commonConfig = {
  client: 'mysql2',
  migrations: {
    directory: './server/migrations',
    tableName: 'knex_migrations'
  }
};

export default {
  development: {
    ...commonConfig,
    connection: {
      host: sanitizeParam(process.env.MYSQL_HOST) || '127.0.0.1',
      port: sanitizeParam(process.env.MYSQL_PORT) || 3306,
      user: sanitizeParam(process.env.MYSQL_USER) || 'root',
      password: sanitizeParam(process.env.MYSQL_PASSWORD) || '',
      database: sanitizeParam(process.env.MYSQL_DATABASE) || 'redemption'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  production: {
    ...commonConfig,
    connection: process.env.DATABASE_URL || {
       host: sanitizeParam(process.env.MYSQL_HOST),
       port: sanitizeParam(process.env.MYSQL_PORT) || (process.env.MYSQL_HOST?.includes('aivencloud.com') ? 20894 : 3306),
       user: sanitizeParam(process.env.MYSQL_USER),
       password: sanitizeParam(process.env.MYSQL_PASSWORD),
       database: sanitizeParam(process.env.MYSQL_DATABASE),
       ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : (process.env.MYSQL_HOST !== 'localhost' && process.env.MYSQL_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false)
    },
    pool: {
      min: 2,
      max: 20
    }
  }
};
