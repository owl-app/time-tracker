import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function getDbConfig(dbName: string): MysqlConnectionOptions | PostgresConnectionOptions {
  return {
    type: (process.env.DB_TYPE as MysqlConnectionOptions['type'] | PostgresConnectionOptions['type']) || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: `test_${dbName}`,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    synchronize: ['true', '1'].includes(process.env.DB_SYNCHRONIZE),
    timezone: process.env.DB_TIMEZONE || 'Z'
  }
};

