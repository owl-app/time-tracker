import { DataSource } from 'typeorm';
import { dropDatabase } from 'typeorm-extension';

import { INestApplication } from '@nestjs/common';

export async function destroy(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);

  await dropDatabase({ options: dataSource.options });
}
