import { DataSourceOptions } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import {
  buildDriverOptions,
  createDriver,
  createSimplePostgresConnection,
  executeSimplePostgresQuery,
  OptionsError,
} from 'typeorm-extension';

export async function truncatePostgresDatabase(options?: DataSourceOptions) {
  if (!options) {
    throw OptionsError.undeterminable();
  }

  const driverOptions = buildDriverOptions(options);
  const driver = createDriver(options) as PostgresDriver;

  const connection = await createSimplePostgresConnection(driver, driverOptions, { options });

  const query = `
    DO
      $$
      DECLARE
          r RECORD;
      BEGIN
          -- Wyłączanie ograniczeń chwilowo, dzięki CASCADE
          FOR r IN (SELECT ${options.database} FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.${options.database}) || ' CASCADE;';
          END LOOP;
      END
    $$;
  `;

  return executeSimplePostgresQuery(connection, query);
}
