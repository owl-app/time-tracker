import TestAgent from 'supertest/lib/agent';
import { SeederEntity } from 'typeorm-extension';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Client,
  CommonActions,
  CrudActions,
  Project,
  RolesEnum,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueClientName } from './seeds/unique';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import projectSeederFactory from './seeds/project/project.factory';
import ProjectSeeder from './seeds/project/project.seed';
import { isStatusSuccess } from '../utils/http';
import { shouldCheckTenantPermission } from '../utils/check-permission';

describe('Client (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    created: Record<string, Partial<Client>>;
    countCreated: Record<string, number>;
    countAllCreated: number;
    archivedClients: string[];
  } = {
    created: {},
    countCreated: {},
    countAllCreated: 0,
    archivedClients: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'client',
      seeds: [ClientSeeder, ProjectSeeder],
      factories: [clientSeederFactory, projectSeederFactory],
    });

    await Promise.all(
      Object.keys(dataUsers).map(async (role) => {
        dataUsers[role as RolesEnum].forEach(async (user) => {
          agentsByRole[role as RolesEnum][user.email] = await createAgent(
            testServer.app,
            user.email
          );
        });
      })
    );
  });

  // afterAll(async () => {
  //   await testServer.close();
  // });

  // run first we need data to compare for rest of the tests
  // describe('Client create (e2e)', () => {
  //   describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
  //     const firstUser = dataUsers[role][0];
  //     const hasPermission = roleHasPermission(
  //       role,
  //       AvalilableCollections.CLIENT,
  //       CrudActions.CREATE
  //     );

  //     describe(`role ${role} and user ${firstUser.email}`, () => {
  //       it(`should ${hasPermission ? 'create' : 'not create'} client`, async () => {
  //         const client = {
  //           name: `Test Client ${firstUser.email}`,
  //         };

  //         const response = await agentsByRole[role][firstUser.email].post(`/clients`).send(client);

  //         expect(response.status).toEqual(hasPermission ? 201 : 403);

  //         if (isStatusSuccess(response.status)) {
  //           expect(response.body).toEqual(
  //             expect.objectContaining({
  //               ...client,
  //               archived: false,
  //             })
  //           );
  //           expect(response.body).toMatchObject({
  //             id: expect.any(String),
  //             name: expect.any(String),
  //             email: expect.toBeOneOf([expect.any(String), null]),
  //             address: expect.toBeOneOf([expect.any(String), null]),
  //             description: expect.toBeOneOf([expect.any(String), null]),
  //             archived: expect.any(Boolean),
  //             createdAt: expect.any(String),
  //             updatedAt: expect.toBeOneOf([expect.any(String), null]),
  //           });

  //           // Using as an example for the rest of the tests
  //           testData.created[firstUser.tenant.id] = response.body;

  //           if (!shouldCheckTenantPermission(role)) {
  //             if (testData.countCreated[firstUser.tenant.id]) {
  //               testData.countCreated[firstUser.tenant.id] += 1;
  //             } else {
  //               testData.countCreated[firstUser.tenant.id] = 1;
  //             }
  //           }

  //           testData.countAllCreated += 1;
  //         }
  //       });

  //       if (hasPermission) {
  //         it(`should validation error`, async () => {
  //           const response = await agentsByRole[role][firstUser.email].post(`/clients`).send({});

  //           expect(response.status).toEqual(422);

  //           expect(response.body).toMatchObject({
  //             errors: {
  //               name: expect.any(Array),
  //             },
  //           });
  //         });
  //       }
  //     });
  //   });
  // });

  describe('Client update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.CREATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} client`, async () => {
          const client = testServer.context
            .getResultSeed<Client[]>(ClientSeeder.name)
            .find(
              (clientSeed) =>
                clientSeed.tenant.id === firstUser.tenant.id && uniqueClientName !== clientSeed.name
            );
          const dataClient = {
            name: `Updated Client ${firstUser.email}`,
            email: 'test@wp.pl',
            address: 'Test address',
            description: 'Test description',
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/clients/${client.id}`)
            .send(dataClient);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(expect.objectContaining(dataClient));
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

        if (hasPermission) {
          it(`should ${
            shouldCheckTenantPermission(role) ? 'update' : 'not update'
          } client another tenant`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id !== firstUser.tenant.id &&
                  uniqueClientName !== clientSeed.name
              );
            const dataClient = {
              name: `Updated Client ${firstUser.email}`,
              email: 'test@wp.pl',
              address: 'Test address',
              description: 'Test description',
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/clients/${client.id}`)
              .send(dataClient);

            expect(response.status).toEqual(shouldCheckTenantPermission(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(expect.objectContaining(dataClient));
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
              // testData.created[roleUpdate] = response.body;
            }
          });

          it(`should validation error`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find((clientSeed) => clientSeed.tenant.id === firstUser.tenant.id);

            const response = await agentsByRole[role][firstUser.email]
              .put(`/clients/${client.id}`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                name: expect.any(Array),
              },
            });
          });
        }
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

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.UPDATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} clients without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/clients');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (shouldCheckTenantPermission(role)) {
              const resultSeed = testServer.context.getResultSeed<Client[]>(ClientSeeder.name);
              const countClients = resultSeed.length + testData.countAllCreated;

              expect(response.body).toHaveProperty('metadata.total', countClients);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((clientSeed) => clientSeed.tenant.id === firstUser.tenant.id);
              const countClients = resultSeed.length + testData.countCreated[firstUser.tenant.id];

              expect(response.body).toHaveProperty('metadata.total', countClients);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } clients with filter archived on active`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            '/clients?filters[archived]=active'
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (shouldCheckTenantPermission(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((clientSeed) => !clientSeed.archived);
              const countClients = resultSeed.length + testData.countAllCreated;

              expect(response.body).toHaveProperty('metadata.total', countClients);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter(
                  (clientSeed) =>
                    clientSeed.tenant.id === firstUser.tenant.id && !clientSeed.archived
                );
              const countClients = resultSeed.length + testData.countCreated[firstUser.tenant.id];

              expect(response.body).toHaveProperty('metadata.total', countClients);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        it(`should ${hasPermission ? 'list' : 'not list'} clients with filter search`, async () => {
          const search = uniqueClientName.substring(0, uniqueClientName.lastIndexOf(' '));

          const response = await agentsByRole[role][firstUser.email].get(
            `/clients?filters[search][type]=contains&filters[search][value]=${search}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (shouldCheckTenantPermission(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((clientSeed) => uniqueClientName === clientSeed.name);

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter(
                  (clientSeed) =>
                    clientSeed.tenant.id === firstUser.tenant.id &&
                    uniqueClientName === clientSeed.name
                );

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });
      });
    });
  });

  describe('Client find (e2e)', () => {

    describe.each<RolesEnum>(AvailableRoles)('find by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.CREATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {

        it(`should ${hasPermission ? 'find' : 'not find'} client`, async () => {
          const client = testServer.context
            .getResultSeed<Client[]>(ClientSeeder.name)
            .find(
              (clientSeed) =>
                clientSeed.tenant.id === firstUser.tenant.id
            );

          const response = await agentsByRole[role][firstUser.email]
            .get(`/clients/${client.id}`);

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                id: client.id,
                name: client.name,
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
          }
        });

        if (hasPermission) {
          it(`should ${
            shouldCheckTenantPermission(role) ? 'find' : 'not find'
          } client another tenant`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id !== firstUser.tenant.id &&
                  uniqueClientName === clientSeed.name
              );

            const response = await agentsByRole[role][firstUser.email]
              .get(`/clients/${client.id}`)

            expect(response.status).toEqual(shouldCheckTenantPermission(role) ? 200 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  id: client.id,
                  name: client.name,
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
            }
          });
        }
      })
    })
  });

  describe('Client archive (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('archive by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CommonActions.ARCHIVE
      );
      const clientArchivedIds: string[] = [];

      describe.each<boolean>([false, true])(`role ${role} and user ${firstUser.email}`, (withProjects) => {
        describe(withProjects ? 'with projects' : 'without projects', () => {
          it(`should ${hasPermission ? 'archive' : 'not archive'} client`, async () => {
            const projectFinded = testServer.context
              .getResultSeed<Project[]>(ProjectSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id === firstUser.tenant.id
              );

            const data = {
              archived: true,
              withProjects,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/clients/archive/${projectFinded.client.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermission ? 202 : 403);

            if (isStatusSuccess(response.status)) {
              const responseProjects = await agentsByRole[role][firstUser.email].get(
                `/projects?filters[archived]=all&filters[clients]=${projectFinded.client.id}&limit=100`
              );

              let resultSeed: Project[] = [];
              let resultSeedCountProjectsActive = 0;
              let resultSeedCountProjectsArchived = 0;

              const activeProjects = responseProjects.body.items.filter(
                (project: Project) => !project.archived
              );
              const archivedProjects = responseProjects.body.items.filter(
                (project: Project) => project.archived
              );

              console.log('activeProjects',projectFinded.id, activeProjects.length);
              console.log('archivedProjects',projectFinded.id, archivedProjects.length);

              if (shouldCheckTenantPermission(role)) {
                resultSeed = testServer.context.getResultSeed<Project[]>(
                  ProjectSeeder.name
                ).filter((project) => project.client.id === projectFinded.client.id);;
              } else {
                resultSeed = testServer.context.getResultSeed<Project[]>(
                  ProjectSeeder.name
                ).filter((project) => project.client.id === projectFinded.client.id);
              }

              if (withProjects) {
                resultSeedCountProjectsActive = 0;
                resultSeedCountProjectsArchived = resultSeed.filter(
                  (project) => project.client.id === projectFinded.client.id
                ).length;
              } else {
                resultSeedCountProjectsActive = resultSeed.filter(
                  (project) => !project.archived && project.client.id === projectFinded.client.id
                ).length;
                resultSeedCountProjectsArchived = resultSeed.filter(
                  (project) => project.archived && project.client.id === projectFinded.client.id
                ).length;
              }

              expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
              expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
            }
          })
        })

        if (hasPermission) {
          describe(withProjects ? 'with projects' : 'without projects', () => {
            it(`should ${
              shouldCheckTenantPermission(role) ? 'archive' : 'not archive'
            } client another tenant`, async () => {
              const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id !== firstUser.tenant.id && uniqueClientName === clientSeed.name
              );

              const data = {
                archived: true,
                withProjects,
              };

              const response = await agentsByRole[role][firstUser.email]
                .patch(`/clients/archive/${client.id}`)
                .send(data);

              expect(response.status).toEqual(shouldCheckTenantPermission(role) ? 202 : 404);

              if (isStatusSuccess(response.status)) {
                const responseProjects = await agentsByRole[role][firstUser.email].get(
                  `/projects?filters[archived]=all&filters[clients]=${client.id}&limit=25`
                );

                let resultSeed: Project[] = [];
                let resultSeedCountProjectsActive = 0;
                let resultSeedCountProjectsArchived = 0;

                const activeProjects = responseProjects.body.items.filter(
                  (project: Project) => !project.archived
                );
                const archivedProjects = responseProjects.body.items.filter(
                  (project: Project) => project.archived
                );

                if (shouldCheckTenantPermission(role)) {
                  resultSeed = testServer.context.getResultSeed<Project[]>(
                    ProjectSeeder.name
                  );
                } else {
                  resultSeed = testServer.context.getResultSeed<Project[]>(
                    ProjectSeeder.name
                  ).filter((project) => project.tenant.id === firstUser.tenant.id);
                }

                if (withProjects) {
                  resultSeedCountProjectsActive = 0;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (project) => project.client.id === client.id
                  ).length;
                } else {
                  resultSeedCountProjectsActive = resultSeed.filter(
                    (project) => !project.archived && project.client.id === client.id
                  ).length;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (project) => project.archived && project.client.id === client.id
                  ).length;
                }

                expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
              }
            });
          })
        }
      });
    });
  });

  describe('Client restore (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('restore by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CommonActions.RESTORE
      );

      describe.each<boolean>([false, true])(`role ${role} and user ${firstUser.email}`, (withProjects) => {
        describe(withProjects ? 'with projects' : 'without projects', () => {
          it(`should ${hasPermission ? 'restore' : 'not restore'} client`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id === firstUser.tenant.id && uniqueClientName === clientSeed.name
              );

            const data = {
              archived: false,
              withProjects,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/clients/archive/${client.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermission ? 202 : 403);

            if (isStatusSuccess(response.status)) {
              const responseProjects = await agentsByRole[role][firstUser.email].get(
                `/projects?filters[archived]=all&filters[clients]=${client.id}&limit=25`
              );

              let resultSeed: Project[] = [];
              let resultSeedCountProjectsActive = 0;
              let resultSeedCountProjectsArchived = 0;

              const activeProjects = responseProjects.body.items.filter(
                (project: Project) => !project.archived
              );
              const archivedProjects = responseProjects.body.items.filter(
                (project: Project) => project.archived
              );

              if (shouldCheckTenantPermission(role)) {
                resultSeed = testServer.context.getResultSeed<Project[]>(
                  ProjectSeeder.name
                );
              } else {
                resultSeed = testServer.context.getResultSeed<Project[]>(
                  ProjectSeeder.name
                ).filter((project) => project.tenant.id === firstUser.tenant.id);
              }

              if (withProjects) {
                resultSeedCountProjectsActive = 0;
                resultSeedCountProjectsArchived = resultSeed.filter(
                  (project) => project.client.id === client.id
                ).length;
              } else {
                resultSeedCountProjectsActive = resultSeed.filter(
                  (project) => !project.archived && project.client.id === client.id
                ).length;
                resultSeedCountProjectsArchived = resultSeed.filter(
                  (project) => project.archived && project.client.id === client.id
                ).length;
              }

              expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
              expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
            }
          })
        })

        if (hasPermission) {
          describe(withProjects ? 'with projects' : 'without projects', () => {
            it(`should ${
              shouldCheckTenantPermission(role) ? 'restore' : 'not restore'
            } client another tenant`, async () => {
              const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id !== firstUser.tenant.id && uniqueClientName === clientSeed.name
              );

              const data = {
                archived: false,
                withProjects,
              };

              const response = await agentsByRole[role][firstUser.email]
                .patch(`/clients/archive/${client.id}`)
                .send(data);

              expect(response.status).toEqual(shouldCheckTenantPermission(role) ? 202 : 404);

              if (isStatusSuccess(response.status)) {
                const responseProjects = await agentsByRole[role][firstUser.email].get(
                  `/projects?filters[archived]=all&filters[clients]=${client.id}&limit=25`
                );

                let resultSeed: Project[] = [];
                let resultSeedCountProjectsActive = 0;
                let resultSeedCountProjectsArchived = 0;

                const activeProjects = responseProjects.body.items.filter(
                  (project: Project) => !project.archived
                );
                const archivedProjects = responseProjects.body.items.filter(
                  (project: Project) => project.archived
                );

                if (shouldCheckTenantPermission(role)) {
                  resultSeed = testServer.context.getResultSeed<Project[]>(
                    ProjectSeeder.name
                  );
                } else {
                  resultSeed = testServer.context.getResultSeed<Project[]>(
                    ProjectSeeder.name
                  ).filter((project) => project.tenant.id === firstUser.tenant.id);
                }

                if (withProjects) {
                  resultSeedCountProjectsActive = resultSeed.filter(
                    (project) => project.client.id === client.id
                  ).length;
                  resultSeedCountProjectsArchived = 0;
                } else {
                  resultSeedCountProjectsActive = 0;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (project) => project.client.id === client.id
                  ).length;
                }

                expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
              }
            });
          })
        }
      });
    });
  });

  describe('Client delete (e2e)', () => {
    const deletedClients: string[] = [];
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CommonActions.ARCHIVE
      );

      describe.each<boolean>([false, true])(`role ${role} and user ${firstUser.email}`, (archived) => {
        describe(archived ? 'archived' : 'active', () => {
          it(`should ${hasPermission && archived ? 'delete' : 'not delete'} client`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (clientSeed) =>
                  clientSeed.tenant.id === firstUser.tenant.id &&
                  clientSeed.archived === archived &&
                  !deletedClients.includes(clientSeed.id)
              );

            const response = await agentsByRole[role][firstUser.email].delete(`/clients/${client.id}`);

            let expectedStatus;

            if (hasPermission) {
              expectedStatus = archived ? 202 : 404;
            } else {
              expectedStatus = 403;
            }
            expect(response.status).toEqual(expectedStatus);

            if (isStatusSuccess(expectedStatus)) {
              deletedClients.push(client.id);
            }
          })
        })

        if (hasPermission) {
          describe(archived ? 'archived' : 'active', () => {
            it(`should ${hasPermission && archived ? 'delete' : 'not delete'} client`, async () => {
              const client = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .find(
                  (clientSeed) =>
                    clientSeed.tenant.id !== firstUser.tenant.id &&
                    clientSeed.archived === archived &&
                    !deletedClients.includes(clientSeed.id)
                );

              const response = await agentsByRole[role][firstUser.email].delete(`/clients/${client.id}`);

              let expectedStatus;

              if (archived) {
                expectedStatus = shouldCheckTenantPermission(role) ? 202 : 404;
              } else {
                expectedStatus = 404;
              }

              expect(response.status).toEqual(expectedStatus);

              if (isStatusSuccess(expectedStatus)) {
                deletedClients.push(client.id);
              }
            })
          })
        }
      });
    });
  });

  // describe('Client delete (e2e)', () => {
  //   const deletedClients: string[] = [];

  //   describe.each<boolean>([false, true])('delete by role', (withArchived) => {
  //     describe.each<[RolesEnum, RolesEnum, boolean]>(
  //       getCasesByRoleWithOwner({
  //         [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //         [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //       })
  //     )(withArchived ? 'archived' : 'active', (role, roleDelete, checkOwner) => {
  //       it(`${role} try delete ${roleDelete} client`, async () => {
  //         if (testData.created[roleDelete]?.id === undefined) return;

  //         const tenantId = dataUsers[roleDelete].tenant.id;
  //         let status = getTestsStatusByOwner(
  //           202,
  //           AvalilableCollections.CLIENT,
  //           CrudActions.DELETE,
  //           roleSeeders,
  //           role,
  //           checkOwner
  //         );
  //         let clientToDelete: Client;

  //         if (withArchived || status === 403) {
  //           clientToDelete = testServer.context
  //             .getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name)
  //             [roleDelete].find(
  //               (client) =>
  //                 tenantId === client.tenant.id &&
  //                 client.archived &&
  //                 !deletedClients.includes(client.id)
  //             );
  //         } else {
  //           status = 404;

  //           clientToDelete = testServer.context
  //             .getResultSeed<CreatedSeedData<Client[]>>(ClientSeeder.name)
  //             [roleDelete].find(
  //               (client) =>
  //                 tenantId === client.tenant.id &&
  //                 !client.archived &&
  //                 !deletedClients.includes(client.id)
  //             );
  //         }

  //         const response = await agentsByRole[role].delete(`/clients/${clientToDelete?.id}`);

  //         expect(response.status).toEqual(status);

  //         if (isStatusSuccess(status)) {
  //           deletedClients.push(clientToDelete.id);
  //         }
  //       });
  //     });
  //   });
  // });
});
