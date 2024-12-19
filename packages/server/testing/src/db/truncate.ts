import { DatabaseDropContext, DriverError, OptionsError } from 'typeorm-extension';

import { truncateMySQLDatabase } from './driver/mysql';
import { truncatePostgresDatabase } from './driver/postgres';

export async function truncateDatabase(context?: DatabaseDropContext) {
  if (!context.options) {
    throw OptionsError.undeterminable();
  }

  if (!context.options.type) {
    throw DriverError.undeterminable();
  }

  switch (context.options.type) {
    case 'mysql':
    case 'mariadb':
      return truncateMySQLDatabase(context);
    case 'postgres':
      return truncatePostgresDatabase(context);
    default:
      throw DriverError.notSupported(context.options.type);
  }
}
