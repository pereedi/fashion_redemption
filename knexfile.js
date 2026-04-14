import dotenv from 'dotenv';
dotenv.config();

const sanitizeHost = (host) => {
  if (!host) return host;
  // Remove http://, https:// and trailing slashes
  return host.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
      host: sanitizeHost(process.env.MYSQL_HOST) || '127.0.0.1',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'redemption'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  production: {
    ...commonConfig,
    connection: process.env.DATABASE_URL || {
       host: sanitizeHost(process.env.MYSQL_HOST),
       port: process.env.MYSQL_PORT || (process.env.MYSQL_HOST?.includes('aivencloud.com') ? 20894 : 3306),
       user: process.env.MYSQL_USER,
       password: process.env.MYSQL_PASSWORD,
       database: process.env.MYSQL_DATABASE,
       ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : (process.env.MYSQL_HOST !== 'localhost' && process.env.MYSQL_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false)
    },
    pool: {
      min: 2,
      max: 20
    }
  }
};
