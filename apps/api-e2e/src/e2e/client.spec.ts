import TestAgent from 'supertest/lib/agent';
import { SeederEntity } from 'typeorm-extension';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Client,
  CrudActions,
  Project,
  RolesEnum,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import BaseRole from '@owl-app/lib-api-core/seeds/rbac/base.role';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueClientId, uniqueClientName } from './seeds/unique';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import projectSeederFactory from './seeds/project/project.factory';
import ProjectSeeder from './seeds/project/project.seed';
import { CreatedSeedData } from './types';
import { isStatusSuccess, getTestsStatusByOwner, getTestsStatusByRole } from '../utils/http';
import { getCasesByRoleWithOwner } from '../utils/cases';

describe('Client (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, TestAgent> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: null,
    [RolesEnum.ROLE_ADMIN_COMPANY]: null,
    [RolesEnum.ROLE_USER]: null,
  };
  let roleSeeders: SeederEntity[] = [];

  // Local test data used across the test suite
  const testData: {
    created: Record<RolesEnum, Partial<Client>>;
    countCreated: Record<RolesEnum, number>;
  } = {
    created: {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
      [RolesEnum.ROLE_ADMIN_COMPANY]: {},
      // set it earlier because it will never created
      [RolesEnum.ROLE_USER]: { id: undefined },
    },
    countCreated: {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: 0,
      [RolesEnum.ROLE_ADMIN_COMPANY]: 0,
      [RolesEnum.ROLE_USER]: 0,
    },
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder, ProjectSeeder],
      factories: [clientSeederFactory, projectSeederFactory],
    });
    roleSeeders = testServer.context.getSederEntityByClass<SeederEntity[]>([BaseRole]);

    await Promise.all(
      Object.keys(dataUsers).map(async (role) => {
        agentsByRole[role as RolesEnum] = await createAgent(
          testServer.app,
          dataUsers[role as RolesEnum].email
        );
      })
    );
  });

  afterAll(async () => {
    await testServer.close();
  });

  // run first we need data to compare for rest of the tests
  describe('Client create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      it(`${role} try create client`, async () => {
        const status = getTestsStatusByRole(
          201,
          AvalilableCollections.CLIENT,
          CrudActions.CREATE,
          roleSeeders
        );
        const client = {
          name: `Test Client ${role}`,
        };
        const response = await agentsByRole[role].post(`/clients`).send(client);

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
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
          testData.created[role] = response.body;
          if (role !== RolesEnum.ROLE_ADMIN_SYSTEM) {
            testData.countCreated[role] += 1;
            testData.countCreated[RolesEnum.ROLE_ADMIN_SYSTEM] += 1;
          } else {
            testData.countCreated[RolesEnum.ROLE_ADMIN_SYSTEM] += 1;
          }
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
      it(`${role} try validation error`, async () => {
        const status = getTestsStatusByRole(
          422,
          AvalilableCollections.CLIENT,
          CrudActions.CREATE,
          roleSeeders
        );

        if (status[role] === 403) return;

        const response = await agentsByRole[role].post(`/clients`).send({});

        expect(response.status).toEqual(status[role]);

        expect(response.body).toMatchObject({
          errors: {
            name: expect.any(Array),
          },
        });
      });
    });
  });

  describe('Client update (e2e)', () => {
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('update by role', (role, roleUpdate, checkOwner) => {
      it(`${role} try update client ${roleUpdate}`, async () => {
        if (testData.created[roleUpdate]?.id === undefined) return;

        const client = {
          name: `Updated Client ${role}`,
          email: 'test@wp.pl',
          address: 'Test address',
          description: 'Test description',
        };
        const status = getTestsStatusByOwner(
          202,
          AvalilableCollections.CLIENT,
          CrudActions.UPDATE,
          roleSeeders,
          role,
          checkOwner
        );
        const response = await agentsByRole[role]
          .put(`/clients/${testData.created[roleUpdate]?.id}`)
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
          testData.created[roleUpdate] = response.body;
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
      it(`${role} try validation error`, async () => {
        const status = getTestsStatusByRole(
          422,
          AvalilableCollections.CLIENT,
          CrudActions.UPDATE,
          roleSeeders
        );

        if (status[role] === 403) return;

        const response = await agentsByRole[role]
          .put(`/clients/${testData.created[role]?.id}`)
          .send({});

        expect(response.status).toEqual(status[role]);
        expect(response.body).toMatchObject({
          errors: {
            name: expect.any(Array),
            email: expect.any(Array),
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

    describe.each<RolesEnum>(AvailableRoles)('without filters', (role) => {
      it(`${role} try list clients`, async () => {
        const status = getTestsStatusByRole(
          200,
          AvalilableCollections.CLIENT,
          CrudActions.LIST,
          roleSeeders
        );

        const response = await agentsByRole[role].get('/clients');

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
          const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Client[]>>(
            ClientSeeder.name
          );

          const countClients = resultSeed[role].length + testData.countCreated[role];

          expect(response.body).toHaveProperty('metadata.total', countClients);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('with filter archived on active', (role) => {
      it(`${role} try list clients archived`, async () => {
        const status = getTestsStatusByRole(
          200,
          AvalilableCollections.CLIENT,
          CrudActions.LIST,
          roleSeeders
        );
        const response = await agentsByRole[role].get('/clients?filters[archived]=active');

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
          const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Client[]>>(
            ClientSeeder.name
          );
          const countClients =
            resultSeed[role].filter((client) => !client.archived).length +
            testData.countCreated[role];

          expect(response.body).toHaveProperty('metadata.total', countClients);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<[RolesEnum, number, number]>([
      [RolesEnum.ROLE_ADMIN_SYSTEM, 200, 2],
      [RolesEnum.ROLE_ADMIN_COMPANY, 200, 1],
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
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('find by role', (role, roleFind, checkOwner) => {
      it(`${role} try find client ${roleFind}`, async () => {
        if (testData.created[roleFind]?.id === undefined) return;

        const status = getTestsStatusByOwner(
          200,
          AvalilableCollections.CLIENT,
          CrudActions.READ,
          roleSeeders,
          role,
          checkOwner
        );

        const response = await agentsByRole[role].get(
          `/clients/${testData.created[roleFind]?.id}`
        );

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          expect(response.body).toEqual(
            expect.objectContaining(testData.created[roleFind])
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
      describe.each<[RolesEnum, RolesEnum, boolean]>(
        getCasesByRoleWithOwner({
          [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
          [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
        })
      )(withProjects ? 'with projects' : 'without projects', (role, roleArchive, checkOwner) => {
        it(`${role} archive archive client ${roleArchive}`, async () => {
          if (testData.created[roleArchive]?.id === undefined) return;

          const status = getTestsStatusByOwner(
            202,
            AvalilableCollections.CLIENT,
            CrudActions.READ,
            roleSeeders,
            role,
            checkOwner
          );

          const data = {
            archived: true,
            withProjects,
          };

          const response = await agentsByRole[role]
            .patch(`/clients/archive/${uniqueClientId[roleArchive]}`)
            .send(data);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            // check count active projects
            const filterClientId = uniqueClientId[roleArchive];
            const responseProjects = await agentsByRole[role].get(
              `/projects?filters[archived]=all&filters[clients]=${filterClientId}&limit=25`
            );

            const activeProjects = responseProjects.body.items.filter(
              (project: Project) => !project.archived
            );
            const archivedProjects = responseProjects.body.items.filter(
              (project: Project) => project.archived
            );
            const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
              ProjectSeeder.name
            );
            let resultSeedCountProjectsActive = 0;
            let resultSeedCountProjectsArchived = 0;

            if (withProjects) {
              resultSeedCountProjectsActive = 0;
              resultSeedCountProjectsArchived = resultSeed[role].filter(
                (project) => project.client.id === filterClientId
              ).length;
            } else {
              resultSeedCountProjectsActive = resultSeed[role].filter(
                (project) => !project.archived && project.client.id === filterClientId
              ).length;
              resultSeedCountProjectsArchived = resultSeed[role].filter(
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
      describe.each<[RolesEnum, RolesEnum, boolean]>(
        getCasesByRoleWithOwner({
          [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
          [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
        })
      )(withProjects ? 'with projects' : 'without projects', (role, roleRestore, checkOwner) => {
        it(`${role} try restore client ${roleRestore}`, async () => {
          if (testData.created[roleRestore]?.id === undefined) return;

          const status = getTestsStatusByOwner(
            202,
            AvalilableCollections.CLIENT,
            CrudActions.READ,
            roleSeeders,
            role,
            checkOwner
          );

          const data = {
            archived: false,
            withProjects,
          };

          const response = await agentsByRole[role]
            .patch(`/clients/archive/${uniqueClientId[roleRestore]}`)
            .send(data);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            // check count active projects
            const filterClientId = uniqueClientId[roleRestore];
            const responseProjects = await agentsByRole[role].get(
              `/projects?filters[archived]=all&filters[clients]=${filterClientId}&limit=25`
            );

            const activeProjects = responseProjects.body.items.filter(
              (project: Project) => !project.archived
            );
            const archivedProjects = responseProjects.body.items.filter(
              (project: Project) => project.archived
            );
            const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
              ProjectSeeder.name
            );
            let resultSeedCountProjectsActive = 0;
            let resultSeedCountProjectsArchived = 0;

            if (withProjects) {
              resultSeedCountProjectsActive = resultSeed[role].filter(
                (project) => project.client.id === filterClientId
              ).length;
              resultSeedCountProjectsArchived = 0;
            } else {
              resultSeedCountProjectsActive = 0;
              resultSeedCountProjectsArchived = resultSeed[role].filter(
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

  describe('Client delete (e2e)', () => {
    const deletedClients: string[] = [];

    describe.each<boolean>([false, true])('delete by role', (withArchived) => {
      describe.each<[RolesEnum, RolesEnum, boolean]>(
        getCasesByRoleWithOwner({
          [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
          [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
        })
      )(withArchived ? 'archived' : 'active', (role, roleDelete, checkOwner) => {
        it(`${role} try delete ${roleDelete} client`, async () => {
          if (testData.created[roleDelete]?.id === undefined) return;

          const tenantId = dataUsers[roleDelete].tenant.id;
          let status = getTestsStatusByOwner(
            202,
            AvalilableCollections.CLIENT,
            CrudActions.DELETE,
            roleSeeders,
            role,
            checkOwner
          );
          let clientToDelete: Client;

          if (withArchived || status === 403) {
            clientToDelete = testServer.context
              .getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name)
              [roleDelete].find(
                (client) =>
                  tenantId === client.tenant.id &&
                  client.archived &&
                  !deletedClients.includes(client.id)
              );
          } else {
            status = 404;

            clientToDelete = testServer.context
              .getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name)
              [roleDelete].find(
                (client) =>
                  tenantId === client.tenant.id &&
                  !client.archived &&
                  !deletedClients.includes(client.id)
              );
          }

          const response = await agentsByRole[role].delete(`/clients/${clientToDelete?.id}`);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            deletedClients.push(clientToDelete.id);
          }
        });
      });
    });
  });
});
