import { DataSource } from 'typeorm';
import { dropDatabase } from 'typeorm-extension';
import { INestApplication } from '@nestjs/common';

import { Context } from './context';
import { bootstrap, BootstrapOptions } from './bootstrap';

export class TestServer {

  constructor(readonly app: INestApplication, private readonly context: Context) {}

  static async start(options: BootstrapOptions): Promise<TestServer> {

    const [app, context] = await bootstrap(options);

    return new TestServer(app, context);
  }

  async close() {
    const dataSource = this.app.get(DataSource);

    await dropDatabase({ options: dataSource.options });

    this.app.close();
  }

  getResultSeed<T>(key: string): T {
    return this.context.resultSeed[key] as T;
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }
}
