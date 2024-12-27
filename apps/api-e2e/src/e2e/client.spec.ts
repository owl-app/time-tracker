import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Client,
  ClientActions,
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
import { hasPermissionAnotherTenant, hasPermissionToArchived } from '../utils/check-permission';

describe('Client (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    createdByTenant: Record<string, Partial<Client>[]>;
    createdAll: Partial<Client>[];
    changedArchived: string[];
  } = {
    createdByTenant: {},
    createdAll: [],
    changedArchived: [],
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

  afterAll(async () => {
    await testServer.close();
  });

  describe('Client create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.CREATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'create' : 'not create'} client`, async () => {
          const data = {
            name: `Test Client ${firstUser.email}`,
          };

          const response = await agentsByRole[role][firstUser.email].post(`/clients`).send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
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

            if (!hasPermissionAnotherTenant(role)) {
              if (testData.createdByTenant[firstUser.tenant.id]) {
                testData.createdByTenant[firstUser.tenant.id].push(response.body);
              } else {
                testData.createdByTenant[firstUser.tenant.id] = [response.body];
              }
            }

            testData.createdAll.push(response.body);
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/clients`).send({});

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

  describe('Client update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.UPDATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} client`, async () => {
          const client = testServer.context
            .getResultSeed<Client[]>(ClientSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id && uniqueClientName !== result.name
            );
          const data = {
            name: `Updated Client ${firstUser.email}`,
            email: 'test@wp.pl',
            address: 'Test address',
            description: 'Test description',
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/clients/${client.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(expect.objectContaining(data));
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
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } client another tenant`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueClientName !== result.name
              );
            const data = {
              name: `Updated Client ${firstUser.email}`,
              email: 'test@wp.pl',
              address: 'Test address',
              description: 'Test description',
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/clients/${client.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(expect.objectContaining(data));
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

          it(`should validation error`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

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
      const hasPermission = roleHasPermission(role, AvalilableCollections.CLIENT, [
        CrudActions.LIST,
        ClientActions.AVAILABLE,
      ]);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} clients without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/clients');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context.getResultSeed<Client[]>(ClientSeeder.name);
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) &&
                    result.tenant.id === firstUser.tenant.id
                );
              const count =
                resultSeed.length +
                (testData.createdByTenant[firstUser.tenant.id].filter((created) =>
                  filterArchived.includes(created.archived)
                ).length ?? 0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } all clients without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/clients?pageable=0');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context.getResultSeed<Client[]>(ClientSeeder.name);
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body.items.length).toEqual(count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) &&
                    result.tenant.id === firstUser.tenant.id
                );
              const count =
                resultSeed.length +
                (testData.createdByTenant[firstUser.tenant.id].filter((created) =>
                  filterArchived.includes(created.archived)
                ).length ?? 0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body.items.length).toEqual(count);
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
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((result) => !result.archived);
              const count =
                resultSeed.length +
                testData.createdAll.filter((created) => !created.archived).length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((result) => result.tenant.id === firstUser.tenant.id && !result.archived);
              const count =
                resultSeed.length +
                (testData.createdByTenant[firstUser.tenant.id].filter(
                  (created) => !created.archived
                ).length ?? 0);

              expect(response.body).toHaveProperty('metadata.total', count);
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
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter((result) => uniqueClientName === result.name);

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) &&
                    result.tenant.id === firstUser.tenant.id &&
                    uniqueClientName === result.name
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
      const hasPermission = roleHasPermission(role, AvalilableCollections.CLIENT, CrudActions.READ);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'find' : 'not find'} client`, async () => {
          const client = testServer.context
            .getResultSeed<Client[]>(ClientSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const response = await agentsByRole[role][firstUser.email].get(`/clients/${client.id}`);

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
            hasPermissionAnotherTenant(role) ? 'find' : 'not find'
          } client another tenant`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueClientName === result.name
              );

            const response = await agentsByRole[role][firstUser.email].get(`/clients/${client.id}`);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 200 : 404);

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
      });
    });
  });

  describe('Client archive (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('archive by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CommonActions.ARCHIVE
      );

      describe.each<boolean>([false, true])(
        `role ${role} and user ${firstUser.email}`,
        (withProjects) => {
          describe(withProjects ? 'with projects' : 'without projects', () => {
            it(`should ${hasPermission ? 'archive' : 'not archive'} client`, async () => {
              const project = testServer.context
                .getResultSeed<Project[]>(ProjectSeeder.name)
                .find(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id &&
                    !testData.changedArchived.includes(result.client.id)
                );

              const data = {
                archived: true,
                withProjects,
              };

              const response = await agentsByRole[role][firstUser.email]
                .patch(`/clients/archive/${project.client.id}`)
                .send(data);

              expect(response.status).toEqual(hasPermission ? 202 : 403);

              if (isStatusSuccess(response.status)) {
                const responseProjects = await agentsByRole[role][firstUser.email].get(
                  `/projects?filters[archived]=all&filters[clients]=${project.client.id}&limit=100`
                );

                let resultSeed: Project[] = [];
                let resultSeedCountProjectsActive = 0;
                let resultSeedCountProjectsArchived = 0;

                const activeProjects = responseProjects.body.items.filter(
                  (responseProject: Project) => !responseProject.archived
                );
                const archivedProjects = responseProjects.body.items.filter(
                  (responseProject: Project) => responseProject.archived
                );

                testData.changedArchived.push(project.client.id);

                resultSeed = testServer.context.getResultSeed<Project[]>(ProjectSeeder.name);

                if (withProjects) {
                  resultSeedCountProjectsActive = 0;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (result) => result.client.id === project.client.id
                  ).length;
                } else {
                  resultSeedCountProjectsActive = resultSeed.filter(
                    (result) => !result.archived && result.client.id === project.client.id
                  ).length;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (result) => result.archived && result.client.id === project.client.id
                  ).length;
                }

                expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
              }
            });
          });

          if (hasPermission) {
            describe(withProjects ? 'with projects' : 'without projects', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) ? 'archive' : 'not archive'
              } client another tenant`, async () => {
                const project = testServer.context
                  .getResultSeed<Project[]>(ProjectSeeder.name)
                  .find(
                    (result) =>
                      result.tenant.id !== firstUser.tenant.id &&
                      !testData.changedArchived.includes(result.client.id)
                  );

                const data = {
                  archived: true,
                  withProjects,
                };

                const response = await agentsByRole[role][firstUser.email]
                  .patch(`/clients/archive/${project.client.id}`)
                  .send(data);

                expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

                if (isStatusSuccess(response.status)) {
                  const responseProjects = await agentsByRole[role][firstUser.email].get(
                    `/projects?filters[archived]=all&filters[clients]=${project.client.id}&limit=25`
                  );

                  let resultSeed: Project[] = [];
                  let resultSeedCountProjectsActive = 0;
                  let resultSeedCountProjectsArchived = 0;

                  const activeProjects = responseProjects.body.items.filter(
                    (responseProject: Project) => !responseProject.archived
                  );
                  const archivedProjects = responseProjects.body.items.filter(
                    (responseProject: Project) => responseProject.archived
                  );

                  testData.changedArchived.push(project.client.id);

                  resultSeed = testServer.context.getResultSeed<Project[]>(ProjectSeeder.name);

                  if (withProjects) {
                    resultSeedCountProjectsActive = 0;
                    resultSeedCountProjectsArchived = resultSeed.filter(
                      (result) => result.client.id === project.client.id
                    ).length;
                  } else {
                    resultSeedCountProjectsActive = resultSeed.filter(
                      (result) => !result.archived && result.client.id === project.client.id
                    ).length;
                    resultSeedCountProjectsArchived = resultSeed.filter(
                      (result) => result.archived && result.client.id === project.client.id
                    ).length;
                  }

                  expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                  expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
                }
              });
            });
          }
        }
      );
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

      describe.each<boolean>([false, true])(
        `role ${role} and user ${firstUser.email}`,
        (withProjects) => {
          describe(withProjects ? 'with projects' : 'without projects', () => {
            it(`should ${hasPermission ? 'restore' : 'not restore'} client`, async () => {
              const project = testServer.context
                .getResultSeed<Project[]>(ProjectSeeder.name)
                .find(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id &&
                    !testData.changedArchived.includes(result.client.id)
                );

              const data = {
                archived: false,
                withProjects,
              };

              const response = await agentsByRole[role][firstUser.email]
                .patch(`/clients/archive/${project.client.id}`)
                .send(data);

              expect(response.status).toEqual(hasPermission ? 202 : 403);

              if (isStatusSuccess(response.status)) {
                const responseProjects = await agentsByRole[role][firstUser.email].get(
                  `/projects?filters[archived]=all&filters[clients]=${project.client.id}&limit=100`
                );

                let resultSeed: Project[] = [];
                let resultSeedCountProjectsActive = 0;
                let resultSeedCountProjectsArchived = 0;

                const activeProjects = responseProjects.body.items.filter(
                  (responseProject: Project) => !responseProject.archived
                );
                const archivedProjects = responseProjects.body.items.filter(
                  (responseProject: Project) => responseProject.archived
                );

                testData.changedArchived.push(project.client.id);

                resultSeed = testServer.context.getResultSeed<Project[]>(ProjectSeeder.name);

                if (withProjects) {
                  resultSeedCountProjectsActive = resultSeed.filter(
                    (result) => result.client.id === project.client.id
                  ).length;
                  resultSeedCountProjectsArchived = 0;
                } else {
                  resultSeedCountProjectsActive = resultSeed.filter(
                    (result) => !result.archived && result.client.id === project.client.id
                  ).length;
                  resultSeedCountProjectsArchived = resultSeed.filter(
                    (result) => result.archived && result.client.id === project.client.id
                  ).length;
                }

                expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
              }
            });
          });

          if (hasPermission) {
            describe(withProjects ? 'with projects' : 'without projects', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) ? 'restore' : 'not restore'
              } client another tenant`, async () => {
                const project = testServer.context
                  .getResultSeed<Project[]>(ProjectSeeder.name)
                  .find(
                    (result) =>
                      result.tenant.id !== firstUser.tenant.id &&
                      !testData.changedArchived.includes(result.client.id)
                  );

                const data = {
                  archived: false,
                  withProjects,
                };

                const response = await agentsByRole[role][firstUser.email]
                  .patch(`/clients/archive/${project.client.id}`)
                  .send(data);

                expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

                if (isStatusSuccess(response.status)) {
                  const responseProjects = await agentsByRole[role][firstUser.email].get(
                    `/projects?filters[archived]=all&filters[clients]=${project.client.id}&limit=25`
                  );

                  let resultSeed: Project[] = [];
                  let resultSeedCountProjectsActive = 0;
                  let resultSeedCountProjectsArchived = 0;

                  const activeProjects = responseProjects.body.items.filter(
                    (responseProject: Project) => !responseProject.archived
                  );
                  const archivedProjects = responseProjects.body.items.filter(
                    (responseProject: Project) => responseProject.archived
                  );

                  testData.changedArchived.push(project.client.id);

                  resultSeed = testServer.context.getResultSeed<Project[]>(ProjectSeeder.name);

                  if (withProjects) {
                    resultSeedCountProjectsActive = resultSeed.filter(
                      (result) => result.client.id === project.client.id
                    ).length;
                    resultSeedCountProjectsArchived = 0;
                  } else {
                    resultSeedCountProjectsActive = resultSeed.filter(
                      (result) => !result.archived && result.client.id === project.client.id
                    ).length;
                    resultSeedCountProjectsArchived = resultSeed.filter(
                      (result) => result.archived && result.client.id === project.client.id
                    ).length;
                  }

                  expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
                  expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
                }
              });
            });
          }
        }
      );
    });
  });

  describe('Client delete (e2e)', () => {
    const deletedClients: string[] = [];
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.CLIENT,
        CrudActions.DELETE
      );

      describe.each<boolean>([false, true])(
        `role ${role} and user ${firstUser.email}`,
        (archived) => {
          describe(archived ? 'archived' : 'active', () => {
            it(`should ${hasPermission && archived ? 'delete' : 'not delete'} client`, async () => {
              const client = testServer.context
                .getResultSeed<Client[]>(ClientSeeder.name)
                .find(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id &&
                    result.archived === archived &&
                    !deletedClients.includes(result.id) &&
                    !testData.changedArchived.includes(result.id)
                );

              const response = await agentsByRole[role][firstUser.email].delete(
                `/clients/${client.id}`
              );

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
            });
          });

          if (hasPermission) {
            describe(archived ? 'archived' : 'active', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) && hasPermission && archived
                  ? 'delete'
                  : 'not delete'
              } client another tenant`, async () => {
                const client = testServer.context
                  .getResultSeed<Client[]>(ClientSeeder.name)
                  .find(
                    (result) =>
                      result.tenant.id !== firstUser.tenant.id &&
                      result.archived === archived &&
                      !deletedClients.includes(result.id) &&
                      !testData.changedArchived.includes(result.id)
                  );

                const response = await agentsByRole[role][firstUser.email].delete(
                  `/clients/${client.id}`
                );

                let expectedStatus;

                if (archived) {
                  expectedStatus = hasPermissionAnotherTenant(role) ? 202 : 404;
                } else {
                  expectedStatus = 404;
                }

                expect(response.status).toEqual(expectedStatus);

                if (isStatusSuccess(expectedStatus)) {
                  deletedClients.push(client.id);
                }
              });
            });
          }
        }
      );
    });
  });
});
