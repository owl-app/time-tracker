import TestAgent from 'supertest/lib/agent';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';
import { Client } from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';

describe('Client (e2e)', () => {
  let app: INestApplication;

  // Local test data used across the test suite
  const testData: { clients: Client[] } = {
    clients: [],
  };

  beforeAll(async () => {
    app = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder],
      factories: [clientSeederFactory],
    });
  });

  // afterAll(async () => {
  //   await destroy(app);
  // });

  describe.each([
    ['adminSystem', 200],
    ['adminCompany', 200],
    ['user', 403],
  ])('Client list (e2e)', (user, status) => {
    let agent: TestAgent;

    beforeEach(async () => {
      agent = await createAgent(app, dataUsers[user].email);
    });

    it(`should list clients ${user} by permissions `, async () => {
      const response = await agent.get('/clients');

      expect(response.status).toEqual(status);

      if (status === 200) {
        expect(response.body).toHaveProperty(
          'metadata.total',
          response.body.items.filter(
            (client: Client) => dataUsers[user].tenant.id === client.tenant.id
          ).length
        );
        expect(response.body).toHaveProperty('items');
      }
    });
  });
});
