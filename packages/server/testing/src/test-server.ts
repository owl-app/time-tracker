import { DataSource } from 'typeorm';
import { dropDatabase } from 'typeorm-extension';
import { INestApplication } from '@nestjs/common';

import { SeederRegistry } from './db/seeder.registry';
import { bootstrap, BootstrapOptions } from './bootstrap';

export class TestServer {
  constructor(readonly app: INestApplication, readonly seederRegistry: SeederRegistry) {}

  static async start(options: BootstrapOptions): Promise<TestServer> {
    const [app, seederRegistry] = await bootstrap(options);

    return new TestServer(app, seederRegistry);
  }

  async close() {
    const dataSource = this.app.get(DataSource);

    // await dropDatabase({ options: dataSource.options });

    this.app.close();
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }
}
