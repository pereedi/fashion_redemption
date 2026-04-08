import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'redemption'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './server/migrations',
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || {
       host: process.env.MYSQL_HOST,
       user: process.env.MYSQL_USER,
       password: process.env.MYSQL_PASSWORD,
       database: process.env.MYSQL_DATABASE,
       ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : (process.env.MYSQL_HOST !== 'localhost' && process.env.MYSQL_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false)
    },
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: './server/migrations',
      tableName: 'knex_migrations'
    }
  }
};
