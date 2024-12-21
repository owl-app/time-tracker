import TestAgent from 'supertest/lib/agent';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';
import { Client } from '@owl-app/lib-contracts';
import { dataUsers, UserTypes } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import { uniqueClientId, uniqueClientName } from './seeds/client/unique';

describe('Client (e2e)', () => {
  let app: INestApplication;
  const agentsByRole: Record<UserTypes, TestAgent> = {
    adminSystem: null,
    adminCompany: null,
    user: null,
  };

  // Local test data used across the test suite
  const testData: {
    clients: Record<Exclude<UserTypes, 'user'>, Client[]>;
    clientCreated: Record<UserTypes, Partial<Client>>;
  } = {
    clients: {
      adminSystem: [],
      adminCompany: [],
    },
    clientCreated: {
      adminSystem: {},
      adminCompany: {},
      // set it earlier because it will never be created
      user: { id: '123'}
    },
  };

  beforeAll(async () => {
    app = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder],
      factories: [clientSeederFactory],
    });

    await Promise.all(
      Object.keys(dataUsers).map(async (role) => {
        agentsByRole[role as UserTypes] = await createAgent(
          app,
          dataUsers[role as UserTypes].email
        );
      })
    );
  });

  afterAll(async () => {
    await destroy(app);
  });

  // run first we need data to compare for rest of the tests
  describe('Client create (e2e)', () => {
    describe.each<[UserTypes, number]>([
      ['adminSystem', 201],
      ['adminCompany', 201],
      ['user', 403],
    ])('create by role', (user, status) => {
      it(`should ${user} ${status !== 200 ? 'not created)' : 'created'} client`, async () => {
        const client = {
          name: `Test Client ${user}`,
        };
        const response = await agentsByRole[user].post(`/clients`).send(client);

        expect(response.status).toEqual(status);

        if (status === 201) {
          expect(response.body.name).toEqual(client.name);
          expect(response.body.archived).toEqual(false);
          expect(response.body).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.toBeOneOf([expect.any(String), null]),
            address: expect.toBeOneOf([expect.any(String), null]),
            description: expect.toBeOneOf([expect.any(String), null]),
            archived: expect.any(Boolean),
            createdAt: expect.any(String),
            updatedAt: expect.toBeOneOf([expect.any(String), null]),
          });

          // Using as an example for the rest of the tests
          testData.clientCreated[user as Exclude<UserTypes, 'user'>] = response.body;
        }
      });
    });

    describe.each<[UserTypes, number]>([
      ['adminSystem', 422],
      ['adminCompany', 422],
    ])('validation by role', (user, status) => {
      it(`should ${user} validation error`, async () => {
        const response = await agentsByRole[user].post(`/clients`).send({});

        expect(response.status).toEqual(status);
        expect(response.body).toMatchObject({
          errors: {
            name: expect.any(Array),
          },
        });
      });
    });
  });

  describe('Client list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each<[UserTypes, number, number]>([
      ['adminSystem', 200, 24],
      ['adminCompany', 200, 12],
      ['user', 403, null],
    ])('without filters', (user, status, countUsers) => {
      it(`should list clients ${user}`, async () => {
        const response = await agentsByRole[user].get('/clients');

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);

          // Using as an example for the rest of the tests
          testData.clients[user as Exclude<UserTypes, 'user'>] = response.body.items;
        }
      });
    });

    describe.each<[UserTypes, number, number]>([
      ['adminSystem', 200, 14],
      ['adminCompany', 200, 7],
    ])('with filter archived on active', (user, status, countUsers) => {
      it(`should list clients ${user}`, async () => {
        const response = await agentsByRole[user].get('/clients?filters[archived]=active');

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<[UserTypes, number, number]>([
      ['adminSystem', 200, 2],
      ['adminCompany', 200, 1],
    ])('with filter search', (user, status, countUsers) => {
      it(`should list clients ${user}`, async () => {
        const search = uniqueClientName.substring(0, uniqueClientName.lastIndexOf(' '));

        const response = await agentsByRole[user].get(
          `/clients?filters[search][type]=contains&filters[search][value]=${search}`
        );

        expect(response.status).toEqual(status);

        if (countUsers) {
          expect(response.body).toHaveProperty('metadata.total', countUsers);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });
  });

  describe('Client find (e2e)', () => {
    describe.each<[UserTypes, UserTypes, number]>([
      ['adminSystem', 'adminSystem', 200],
      ['adminCompany', 'adminCompany', 200],
      ['adminCompany', 'adminSystem', 404],
      ['user', 'user', 403],
    ])('find by role', (user, findClient, status) => {
      it(`should ${status !== 200 ? 'not find)' : 'find'} client ${user}`, async () => {
        const response = await agentsByRole[user].get(
          `/clients/${
            testData.clientCreated[findClient]?.id
          }`
        );

        expect(response.status).toEqual(status);

        if (status === 200) {
          expect(response.body).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.toBeOneOf([expect.any(String), null]),
            address: expect.toBeOneOf([expect.any(String), null]),
            description: expect.toBeOneOf([expect.any(String), null]),
            archived: expect.any(Boolean),
            createdAt: expect.any(String),
            updatedAt: expect.toBeOneOf([expect.any(String), null]),
          });
        }
      });
    });
  });

  // describe.each<[UserTypes, string, number]>([
  //   ['adminSystem', uniqueClientId.adminSystem, 200],
  //   ['adminCompany', uniqueClientId.adminCompany, 200],
  //   ['adminCompany', uniqueClientId.adminSystem, 403],
  //   ['user', null, 403],
  // ])('Client update (e2e) ', (user, id, status) => {
  //   it(`should ${status !== 200 ? 'not find)' : 'find'} client ${user}`, async () => {
  //     const response = await agentsByRole[user].put(`/clients/${id}`);

  //     expect(response.status).toEqual(status);

  //     if (status === 200) {
  //       expect(response.body).toMatchObject({
  //         id: expect.any(String),
  //         name: expect.any(String),
  //         email: expect.toBeOneOf([expect.any(String), null]),
  //         address: expect.toBeOneOf([expect.any(String), null]),
  //         description: expect.toBeOneOf([expect.any(String), null]),
  //         archived: expect.any(Boolean),
  //         createdAt: expect.any(String),
  //         updatedAt: expect.toBeOneOf([expect.any(String), null]),
  //       });
  //     }
  //   });
  // });
});
