import { DataSourceOptions } from 'typeorm';
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver';
import { buildDriverOptions, createDriver, DriverOptions, OptionsError } from 'typeorm-extension';

export async function createSimpleSQLiteConnection(driver: SqliteDriver, options: DriverOptions) {
  const { Database } = driver.sqlite;

  return new Database(options.database);
}

export async function truncateSQLiteDatabase(options?: DataSourceOptions) {
  if (!options) {
    throw OptionsError.undeterminable();
  }

  const driverOptions = buildDriverOptions(options);
  const driver = createDriver(options) as SqliteDriver;

  const connection = await createSimpleSQLiteConnection(driver, driverOptions);

  connection.all(
    `SELECT name FROM sqlite_master WHERE type='table'`,
    [],
    (error: any, tables: any[]) => {
      if (error) {
        throw error;
      }

      tables.forEach(async (table: any) => {
        await connection.run(`DELETE FROM ${table.name};`);

        await connection.run(`DELETE FROM sqlite_sequence WHERE name='${table.name}';`);
      });
    }
  );
}
