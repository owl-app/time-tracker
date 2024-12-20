import TestAgent from 'supertest/lib/agent';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';
import { Client } from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import { UserType } from '../types';
import { uniqueClientId, uniqueClientName } from './seeds/client/unique';


describe('Client (e2e)', () => {
  let app: INestApplication;

  // Local test data used across the test suite
  const testData: { clients: Record<Exclude<UserType, 'user'>, Client[]> } = {
    clients: {
      adminSystem: [],
      adminCompany: [],
    },
  };

  beforeAll(async () => {
    app = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder],
      factories: [clientSeederFactory],
    });
  });

  afterAll(async () => {
    await destroy(app);
  });

  describe.each([
    ['adminSystem', 200, 22],
    ['adminCompany', 200, 11],
    ['user', 403, null],
  ])('Client list (e2e)', (user, status, countUsers) => {
    let agent: TestAgent;

    beforeEach(async () => {
      agent = await createAgent(app, dataUsers[user].email);
    });

    it(`should list clients ${user}`, async () => {
      const response = await agent.get('/clients');

      expect(response.status).toEqual(status);

      if (countUsers) {
        expect(response.body).toHaveProperty('metadata.total', countUsers);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toMatchObject({
          metadata: {
            total: expect.any(Number),
          },
          items: expect.any(Array),
        });

        // Using as an example for the rest of the tests
        testData.clients[user as Exclude<UserType, 'user'>] = response.body.items;
      }
    });
  });

  describe('Client list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each([
      ['adminSystem', 200, 22],
      ['adminCompany', 200, 11],
      ['user', 403, null],
    ])('without filters', (user, status, countUsers) => {
      let agent: TestAgent;

      beforeEach(async () => {
        agent = await createAgent(app, dataUsers[user].email);
      });

      it(`should list clients ${user}`, async () => {
        const response = await agent.get('/clients');

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);

          // Using as an example for the rest of the tests
          testData.clients[user as Exclude<UserType, 'user'>] = response.body.items;
        }
      });
    });

    describe.each([
      ['adminSystem', 200, 12],
      ['adminCompany', 200, 6],
    ])('with filter archived on active', (user, status, countUsers) => {
      let agent: TestAgent;

      beforeEach(async () => {
        agent = await createAgent(app, dataUsers[user].email);
      });

      it(`should list clients ${user}`, async () => {
        const response = await agent.get('/clients?filters[archived]=active');

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);

          // Using as an example for the rest of the tests
          testData.clients[user as Exclude<UserType, 'user'>] = response.body.items;
        }
      });
    });

    describe.each([
      ['adminSystem', 200, 2],
      ['adminCompany', 200, 1],
    ])('with filter search', (user, status, countUsers) => {
      let agent: TestAgent;

      beforeEach(async () => {
        agent = await createAgent(app, dataUsers[user].email);
      });

      it(`should list clients ${user}`, async () => {
        const search = uniqueClientName.substring(0, uniqueClientName.lastIndexOf(' '));

        const response = await agent.get(
          `/clients?filters[search][type]=contains&filters[search][value]=${search}`
        );

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);

          // Using as an example for the rest of the tests
          testData.clients[user as Exclude<UserType, 'user'>] = response.body.items;
        }
      });
    });

    describe.each([
      ['adminSystem', uniqueClientId.adminSystem, 200],
      ['adminCompany', uniqueClientId.adminCompany, 200],
      ['user', null, 403],
    ])('Client find (e2e) ', (user, id, status) => {
      let agent: TestAgent;

      beforeEach(async () => {
        agent = await createAgent(app, dataUsers[user].email);
      });

      it(`should find client ${user}`, async () => {
        const response = await agent.get(`/clients/${id}`);

        expect(response.status).toEqual(status);

        if (id) {
          expect(response.body).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.toBeOneOf([expect.any(Date), null]),
            address: expect.toBeOneOf([expect.any(Date), null]),
            description: expect.toBeOneOf([expect.any(Date), null]),
            archived: expect.any(Boolean),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        }
      });
    });
  });
});
