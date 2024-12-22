import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import { Client, Project } from '@owl-app/lib-contracts';
import { dataUsers, UserTypes } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueClientId, uniqueClientName } from './seeds/unique';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import projectSeederFactory from './seeds/project/project.factory';
import ProjectSeeder from './seeds/project/project.seed';
import { CreatedSeedData } from './types';
import { isStatusSuccess } from '../utils/http';

describe('Client (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<UserTypes, TestAgent> = {
    adminSystem: null,
    adminCompany: null,
    user: null,
  };

  // Local test data used across the test suite
  const testData: {
    clientCreated: Record<UserTypes, Partial<Client>>;
    clientCountCreated: {
      adminSystem: number;
      adminCompany: number;
      user: number;
    };
  } = {
    clientCreated: {
      adminSystem: {},
      adminCompany: {},
      // set it earlier because it will never created
      user: { id: '123' },
    },
    clientCountCreated: {
      adminSystem: 0,
      adminCompany: 0,
      user: 0,
    },
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder, ProjectSeeder],
      factories: [clientSeederFactory, projectSeederFactory],
    });

    await Promise.all(
      Object.keys(dataUsers).map(async (role) => {
        agentsByRole[role as UserTypes] = await createAgent(
          testServer.app,
          dataUsers[role as UserTypes].email
        );
      })
    );
  });

  afterAll(async () => {
    await testServer.close();
  });

  // run first we need data to compare for rest of the tests
  describe('Client create (e2e)', () => {
    describe.each<[UserTypes, number]>([
      ['adminSystem', 201],
      ['adminCompany', 201],
      ['user', 403],
    ])('create by role', (user, status) => {
      it(`should ${user} ${status !== 200 ? 'not create' : 'create'} client`, async () => {
        const client = {
          name: `Test Client ${user}`,
        };
        const response = await agentsByRole[user].post(`/clients`).send(client);

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          expect(response.body).toEqual(
            expect.objectContaining({
              ...client,
              archived: false,
            })
          );
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
          if (user !== 'adminSystem') {
            testData.clientCountCreated[user as Exclude<UserTypes, 'user'>] += 1;
            testData.clientCountCreated.adminSystem += 1;
          } else {
            testData.clientCountCreated.adminSystem += 1;
          }
        }
      });
    });

    describe('Client update (e2e)', () => {
      describe.each<[UserTypes, UserTypes, number]>([
        ['adminSystem', 'adminSystem', 202],
        ['adminCompany', 'adminCompany', 202],
        ['adminCompany', 'adminSystem', 404],
        ['user', 'user', 403],
      ])('update by role', (user, updateUser, status) => {
        it(`should ${user} ${status !== 200 ? 'not update' : 'update'} client`, async () => {
          const client = {
            name: `Updated Client ${user}`,
            email: 'test@wp.pl',
            address: 'Test address',
            description: 'Test description',
          };
          const response = await agentsByRole[user]
            .put(`/clients/${testData.clientCreated[updateUser]?.id}`)
            .send(client);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            expect(response.body).toEqual(expect.objectContaining(client));
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

    describe.each<[UserTypes, number]>([
      ['adminSystem', 200],
      ['adminCompany', 200],
      ['user', 403],
    ])('without filters', (user, status) => {
      it(`should list clients ${user}`, async () => {
        const response = await agentsByRole[user].get('/clients');

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          const resultSeed = testServer.getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name);
          const countClients = resultSeed[user].length + testData.clientCountCreated[user];

          expect(response.body).toHaveProperty('metadata.total', countClients);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<[UserTypes, number]>([
      ['adminSystem', 200],
      ['adminCompany', 200],
    ])('with filter archived on active', (user, status) => {
      it(`should list clients ${user}`, async () => {
        const response = await agentsByRole[user].get('/clients?filters[archived]=active');

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          const resultSeed = testServer.getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name);
          const countClients =
            resultSeed[user].filter((client) => !client.archived).length +
            testData.clientCountCreated[user];

          expect(response.body).toHaveProperty('metadata.total', countClients);
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
        expect(response.body).toHaveProperty('metadata.total', countUsers);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toMatchObject(exceptedBodyFormats);
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
      it(`should ${status !== 200 ? 'not find' : 'find'} client ${user}`, async () => {
        const response = await agentsByRole[user].get(
          `/clients/${testData.clientCreated[findClient]?.id}`
        );

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          expect(response.body).toEqual(
            expect.objectContaining(testData.clientCreated[findClient])
          );
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
  describe('Client archive (e2e)', () => {
    describe.each<boolean>([false, true])('archive by role', (withProjects) => {
      describe.each<[UserTypes, UserTypes, number]>([
        ['adminSystem', 'adminSystem', 202],
        ['adminCompany', 'adminCompany', 202],
        ['adminCompany', 'adminSystem', 404],
        ['user', 'user', 403],
      ])(withProjects ? 'with projects' : 'without projects', (user, archiveClient, status) => {
        it(`should ${status !== 202 ? 'not archive' : 'archive'} client ${user}`, async () => {
          const data = {
            archived: true,
            withProjects,
          };

          const response = await agentsByRole[user]
            .patch(`/clients/archive/${uniqueClientId[archiveClient]}`)
            .send(data);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            // check count active projects
            const filterClientId = uniqueClientId[archiveClient];
            const responseProjects = await agentsByRole[user].get(
              `/projects?filters[archived]=all&filters[clients]=${filterClientId}&limit=25`
            );

            const activeProjects = responseProjects.body.items.filter(
              (project: Project) => !project.archived
            );
            const archivedProjects = responseProjects.body.items.filter(
              (project: Project) => project.archived
            );
            const resultSeed = testServer.getResultSeed<CreatedSeedData<Project[]>>(
              ProjectSeeder.name
            );
            let resultSeedCountProjectsActive = 0;
            let resultSeedCountProjectsArchived = 0;

            if (withProjects) {
              resultSeedCountProjectsActive = 0;
              resultSeedCountProjectsArchived = resultSeed[user].filter(
                (project) => project.client.id === filterClientId
              ).length;
            } else {
              resultSeedCountProjectsActive = resultSeed[user].filter(
                (project) => !project.archived && project.client.id === filterClientId
              ).length;
              resultSeedCountProjectsArchived = resultSeed[user].filter(
                (project) => project.archived && project.client.id === filterClientId
              ).length;
            }

            expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
            expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
          }
        });
      });
    });
  });

  describe('Client restore (e2e)', () => {
    describe.each<boolean>([false, true])('restore by role', (withProjects) => {
      describe.each<[UserTypes, UserTypes, number]>([
        ['adminSystem', 'adminSystem', 202],
        ['adminCompany', 'adminCompany', 202],
        ['adminCompany', 'adminSystem', 404],
        ['user', 'user', 403],
      ])(withProjects ? 'with projects' : 'without projects', (user, archiveClient, status) => {
        it(`should ${status !== 202 ? 'not restore' : 'restore'} client ${user}`, async () => {
          const data = {
            archived: false,
            withProjects,
          };

          const response = await agentsByRole[user]
            .patch(`/clients/archive/${uniqueClientId[archiveClient]}`)
            .send(data);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            // check count active projects
            const filterClientId = uniqueClientId[archiveClient];
            const responseProjects = await agentsByRole[user].get(
              `/projects?filters[archived]=all&filters[clients]=${filterClientId}&limit=25`
            );

            const activeProjects = responseProjects.body.items.filter(
              (project: Project) => !project.archived
            );
            const archivedProjects = responseProjects.body.items.filter(
              (project: Project) => project.archived
            );
            const resultSeed = testServer.getResultSeed<CreatedSeedData<Project[]>>(
              ProjectSeeder.name
            );
            let resultSeedCountProjectsActive = 0;
            let resultSeedCountProjectsArchived = 0;

            if (withProjects) {
              resultSeedCountProjectsActive = resultSeed[user].filter(
                (project) => project.client.id === filterClientId
              ).length;
              resultSeedCountProjectsArchived = 0;
            } else {
              resultSeedCountProjectsActive = 0;
              resultSeedCountProjectsArchived = resultSeed[user].filter(
                (project) => project.client.id === filterClientId
              ).length;
            }

            expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
            expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
          }
        });
      });
    });
  });
});
