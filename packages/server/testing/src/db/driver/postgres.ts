import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import {
  buildDriverOptions,
  createDriver,
  createSimplePostgresConnection,
  DatabaseDropContext,
  executeSimplePostgresQuery,
  OptionsError,
} from 'typeorm-extension';

export async function truncatePostgresDatabase(context?: DatabaseDropContext) {
  if (!context.options) {
    throw OptionsError.undeterminable();
  }

  const options = buildDriverOptions(context.options);
  const driver = createDriver(context.options) as PostgresDriver;

  const connection = await createSimplePostgresConnection(driver, options, context);

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
