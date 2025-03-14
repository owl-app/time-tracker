import { DataSourceOptions } from 'typeorm';
import { createDatabase, dropDatabase } from 'typeorm-extension';

export async function dbInitializer(options: DataSourceOptions): Promise<void> {
  try {
    await dropDatabase({ ifExist: true, options });

    await createDatabase({ ifNotExist: true, synchronize: false, options });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating database: ', error);
  }
}
