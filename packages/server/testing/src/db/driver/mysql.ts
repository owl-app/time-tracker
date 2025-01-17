import { DataSourceOptions } from 'typeorm';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import {
  buildDriverOptions,
  createDriver,
  createSimpleMySQLConnection,
  executeSimpleMysqlQuery,
  OptionsError,
} from 'typeorm-extension';

export async function truncateMySQLDatabase(options?: DataSourceOptions) {
  if (!options) {
    throw OptionsError.undeterminable();
  }

  const driverOptions = buildDriverOptions(options);
  const driver = createDriver(options) as MysqlDriver;

  const connection = await createSimpleMySQLConnection(driver, driverOptions);

  const query = `
    SELECT CONCAT('TRUNCATE TABLE ', TABLE_NAME, ';') AS sql_command
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = '${options.database}';
  `;

  await executeSimpleMysqlQuery(connection, 'SET FOREIGN_KEY_CHECKS=0;', false);
  const result = (await executeSimpleMysqlQuery(connection, query, false)) as Record<
    string,
    never
  >[];
  await executeSimpleMysqlQuery(connection, `USE ${options.database}`, false);
  // eslint-disable-next-line no-restricted-syntax
  for (const row of result) {
    // eslint-disable-next-line no-await-in-loop
    await executeSimpleMysqlQuery(connection, row.sql_command, false);
  }
  await executeSimpleMysqlQuery(connection, 'SET FOREIGN_KEY_CHECKS=1;');
  return result;
}
