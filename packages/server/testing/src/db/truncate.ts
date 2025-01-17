import { DataSourceOptions } from 'typeorm';
import { DriverError, OptionsError } from 'typeorm-extension';

import { truncateMySQLDatabase } from './driver/mysql';
import { truncatePostgresDatabase } from './driver/postgres';
import { truncateSQLiteDatabase } from './driver/sqlite';

export async function truncateDatabase(options: DataSourceOptions) {
  if (!options) {
    throw OptionsError.undeterminable();
  }

  if (!options.type) {
    throw DriverError.undeterminable();
  }

  switch (options.type) {
    case 'mysql':
    case 'mariadb':
      return truncateMySQLDatabase(options);
    case 'postgres':
      return truncatePostgresDatabase(options);
    case 'sqlite':
    case 'better-sqlite3':
      return truncateSQLiteDatabase(options);
    default:
      throw DriverError.notSupported(options.type);
  }
}
