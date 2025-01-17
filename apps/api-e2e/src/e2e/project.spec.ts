import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Project,
  CrudActions,
  RolesEnum,
  Client,
  ProjectActions,
  CommonActions,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import clientSeederFactory from './seeds/client/client.factory';
import TestClientSeeder from './seeds/client/client.seed';
import projectSeederFactory from './seeds/project/project.factory';
import TestProjectSeeder from './seeds/project/project.seed';
import { isStatusSuccess } from '../utils/http';
import { hasPermissionAnotherTenant, hasPermissionToArchived } from '../utils/check-permission';
import { uniqueProjectName } from './seeds/unique';

describe('Project (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    createdByTenant: Record<string, Partial<Project>[]>;
    createdAll: Partial<Project>[];
    changedArchived: string[];
    updatedClient: string[];
  } = {
    createdByTenant: {},
    createdAll: [],
    changedArchived: [],
    updatedClient: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'project',
      seeds: [TestClientSeeder, TestProjectSeeder],
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

  describe('Project create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CrudActions.CREATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${
          hasPermission ? 'create' : 'not create'
        } project with project has the same tenant`, async () => {
          const client = testServer.seederRegistry
            .getResultSeed<Client[]>(TestClientSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const data = {
            name: `Test Project ${firstUser.email}`,
            client,
          };
          const response = await agentsByRole[role][firstUser.email].post(`/projects`).send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                client: expect.objectContaining({
                  id: data.client.id,
                  name: data.client.name,
                }),
                archived: false,
              })
            );
            expect(response.body).toMatchObject({
              id: expect.any(String),
              name: expect.any(String),
              client: {
                id: expect.any(String),
                name: expect.any(String),
                email: expect.toBeOneOf([expect.any(String), null]),
                address: expect.toBeOneOf([expect.any(String), null]),
                description: expect.toBeOneOf([expect.any(String), null]),
                archived: expect.any(Boolean),
                createdAt: expect.any(String),
                updatedAt: expect.toBeOneOf([expect.any(String), null]),
              },
              archived: expect.any(Boolean),
              createdAt: expect.any(String),
              updatedAt: expect.toBeOneOf([expect.any(String), null]),
            });

            // Using as an example for the rest of the tests
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
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'create' : 'not create'
          } project with project has diffrent tenant`, async () => {
            const client = testServer.seederRegistry
              .getResultSeed<Client[]>(TestClientSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              name: `Test Project ${firstUser.email}`,
              client,
            };
            const response = await agentsByRole[role][firstUser.email].post(`/projects`).send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 201 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  client: expect.objectContaining({
                    id: data.client.id,
                    name: data.client.name,
                  }),
                  archived: false,
                })
              );
              expect(response.body).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                client: {
                  id: expect.any(String),
                  name: expect.any(String),
                  email: expect.toBeOneOf([expect.any(String), null]),
                  address: expect.toBeOneOf([expect.any(String), null]),
                  description: expect.toBeOneOf([expect.any(String), null]),
                  archived: expect.any(Boolean),
                  createdAt: expect.any(String),
                  updatedAt: expect.toBeOneOf([expect.any(String), null]),
                },
                archived: expect.any(Boolean),
                createdAt: expect.any(String),
                updatedAt: expect.toBeOneOf([expect.any(String), null]),
              });

              // Using as an example for the rest of the tests
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

          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/projects`).send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                name: expect.any(Array),
                client: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });

  describe('Project update (e2e)', () => {
    const exceptedBodyFormats = {
      id: expect.any(String),
      name: expect.any(String),
      client: {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.toBeOneOf([expect.any(String), null]),
        address: expect.toBeOneOf([expect.any(String), null]),
        description: expect.toBeOneOf([expect.any(String), null]),
        archived: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.toBeOneOf([expect.any(String), null]),
      },
      archived: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.toBeOneOf([expect.any(String), null]),
    };

    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CrudActions.UPDATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} project`, async () => {
          const client = testServer.seederRegistry
            .getResultSeed<Client[]>(TestClientSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id && uniqueProjectName !== result.name
            );
          const data = {
            name: `Updated Project ${firstUser.email}`,
            client,
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/projects/${project.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                client: expect.objectContaining({
                  id: data.client.id,
                  name: data.client.name,
                }),
                archived: project.archived,
              })
            );
            expect(response.body).toMatchObject(exceptedBodyFormats);

            testData.updatedClient.push(project.client.id);
            testData.updatedClient.push(client.id);
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } project another tenant`, async () => {
            const client = testServer.seederRegistry
              .getResultSeed<Client[]>(TestClientSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueProjectName !== result.name
              );
            const data = {
              name: `Updated Project ${firstUser.email}`,
              client,
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/projects/${project.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  client: expect.objectContaining({
                    id: data.client.id,
                    name: data.client.name,
                  }),
                  archived: project.archived,
                })
              );
              expect(response.body).toMatchObject(exceptedBodyFormats);

              testData.updatedClient.push(project.client.id);
              testData.updatedClient.push(client.id);
            }
          });

          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } project with project has diffrent tenant`, async () => {
            const client = testServer.seederRegistry
              .getResultSeed<Client[]>(TestClientSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id === firstUser.tenant.id && uniqueProjectName !== result.name
              );

            const data = {
              name: `Test Project ${firstUser.email}`,
              client,
            };
            const response = await agentsByRole[role][firstUser.email]
              .put(`/projects/${project.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  client: expect.objectContaining({
                    id: data.client.id,
                    name: data.client.name,
                  }),
                  archived: project.archived,
                })
              );
              expect(response.body).toMatchObject(exceptedBodyFormats);

              testData.updatedClient.push(project.client.id);
              testData.updatedClient.push(client.id);
            }
          });

          it(`should validation error`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueProjectName !== result.name
              );

            const response = await agentsByRole[role][firstUser.email]
              .put(`/projects/${project.id}`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                name: expect.any(Array),
                client: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });

  describe('Project list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.PROJECT, [
        CrudActions.LIST,
        ProjectActions.AVAILABLE,
      ]);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} projects without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/projects');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry.getResultSeed<Project[]>(
                TestProjectSeeder.name
              );
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
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
        } all projects without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/projects?pageable=0');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry.getResultSeed<Client[]>(TestClientSeeder.name);
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body.items.length).toEqual(count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
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
        } projects with filter archived on active`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            '/projects?filters[archived]=active'
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter((result) => !result.archived);
              const count =
                resultSeed.length +
                testData.createdAll.filter((created) => !created.archived).length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
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

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } projects with filter search`, async () => {
          const search = uniqueProjectName.substring(0, uniqueProjectName.lastIndexOf(' '));

          const response = await agentsByRole[role][firstUser.email].get(
            `/projects?filters[search][type]=contains&filters[search][value]=${search}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter((result) => uniqueProjectName === result.name);

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) &&
                    result.tenant.id === firstUser.tenant.id &&
                    uniqueProjectName === result.name
                );

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } projects with filter client has the same tenant`, async () => {
          const { client } = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                result.name !== uniqueProjectName &&
                !testData.updatedClient.includes(result.client.id)
            );
          const response = await agentsByRole[role][firstUser.email].get(
            `/projects?filters[clients]=${client.id}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter((result) => client.id === result.client.id);
              const count =
                resultSeed.length +
                (testData.createdAll.filter((created) => created.client.id === client.id).length ??
                  0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) && client.id === result.client.id
                );
              const count =
                resultSeed.length +
                (testData.createdByTenant[firstUser.tenant.id].filter(
                  (created) => created.client.id === client.id
                ).length ?? 0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } projects with filter client has diffrent tenant`, async () => {
          const { client } = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find(
              (result) =>
                result.tenant.id !== firstUser.tenant.id &&
                result.name !== uniqueProjectName &&
                !testData.updatedClient.includes(result.client.id)
            );
          const response = await agentsByRole[role][firstUser.email].get(
            `/projects?filters[clients]=${client.id}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .filter((result) => client.id === result.client.id);
              const count =
                resultSeed.length +
                (testData.createdAll.filter((created) => created.client.id === client.id).length ??
                  0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              expect(response.body).toHaveProperty('metadata.total', 0);
              expect(response.body).toHaveProperty('items');
            }
          }
        });
      });
    });
  });

  describe('Project find (e2e)', () => {
    const exceptedBodyFormats = {
      id: expect.any(String),
      name: expect.any(String),
      client: {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.toBeOneOf([expect.any(String), null]),
        address: expect.toBeOneOf([expect.any(String), null]),
        description: expect.toBeOneOf([expect.any(String), null]),
        archived: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.toBeOneOf([expect.any(String), null]),
      },
      archived: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.toBeOneOf([expect.any(String), null]),
    };

    describe.each<RolesEnum>(AvailableRoles)('find by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CrudActions.READ
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'find' : 'not find'} project`, async () => {
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const response = await agentsByRole[role][firstUser.email].get(`/projects/${project.id}`);

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                id: project.id,
                name: project.name,
                client: expect.objectContaining({
                  id: project.client.id,
                  name: project.client.name,
                }),
                archived: project.archived,
              })
            );
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'find' : 'not find'
          } project another tenant`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueProjectName === result.name
              );

            const response = await agentsByRole[role][firstUser.email].get(
              `/projects/${project.id}`
            );

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 200 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  id: project.id,
                  name: project.name,
                  client: expect.objectContaining({
                    id: project.client.id,
                    name: project.client.name,
                  }),
                  archived: project.archived,
                })
              );
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          });
        }
      });
    });
  });

  describe('Project archive (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('archive by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CommonActions.ARCHIVE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'archive' : 'not archive'} project`, async () => {
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                !testData.changedArchived.includes(result.id)
            );

          const data = {
            archived: true,
          };

          const response = await agentsByRole[role][firstUser.email]
            .patch(`/projects/archive/${project.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'archive' : 'not archive'
          } project another tenant`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id &&
                  !testData.changedArchived.includes(result.id)
              );

            const data = {
              archived: true,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/projects/archive/${project.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);
          });
        }
      });
    });
  });

  describe('Project restore (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('restore by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CommonActions.RESTORE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'restore' : 'not restore'} project`, async () => {
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                !testData.changedArchived.includes(result.id)
            );

          const data = {
            archived: false,
          };

          const response = await agentsByRole[role][firstUser.email]
            .patch(`/projects/archive/${project.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'restore' : 'not restore'
          } project another tenant`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id &&
                  !testData.changedArchived.includes(result.id)
              );

            const data = {
              archived: false,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/projects/archive/${project.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);
          });
        }
      });
    });
  });

  describe('Project delete (e2e)', () => {
    const deleted: string[] = [];
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PROJECT,
        CrudActions.DELETE
      );

      describe.each<boolean>([false, true])(
        `role ${role} and user ${firstUser.email}`,
        (archived) => {
          describe(archived ? 'archived' : 'active', () => {
            it(`should ${
              hasPermission && archived ? 'delete' : 'not delete'
            } project`, async () => {
              const project = testServer.seederRegistry
                .getResultSeed<Project[]>(TestProjectSeeder.name)
                .find(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id &&
                    result.archived === archived &&
                    !deleted.includes(result.id) &&
                    !testData.changedArchived.includes(result.id)
                );

              const response = await agentsByRole[role][firstUser.email].delete(
                `/projects/${project.id}`
              );

              let expectedStatus;

              if (hasPermission) {
                expectedStatus = archived ? 202 : 404;
              } else {
                expectedStatus = 403;
              }
              expect(response.status).toEqual(expectedStatus);

              if (isStatusSuccess(expectedStatus)) {
                deleted.push(project.id);
              }
            });
          });

          if (hasPermission) {
            describe(archived ? 'archived' : 'active', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) && hasPermission && archived
                  ? 'delete'
                  : 'not delete'
              } project another tenant`, async () => {
                const project = testServer.seederRegistry
                  .getResultSeed<Project[]>(TestProjectSeeder.name)
                  .find(
                    (result) =>
                      result.tenant.id !== firstUser.tenant.id &&
                      result.archived === archived &&
                      !deleted.includes(result.id) &&
                      !testData.changedArchived.includes(result.id)
                  );

                const response = await agentsByRole[role][firstUser.email].delete(
                  `/projects/${project.id}`
                );

                let expectedStatus;

                if (archived) {
                  expectedStatus = hasPermissionAnotherTenant(role) ? 202 : 404;
                } else {
                  expectedStatus = 404;
                }

                expect(response.status).toEqual(expectedStatus);

                if (isStatusSuccess(expectedStatus)) {
                  deleted.push(project.id);
                }
              });
            });
          }
        }
      );
    });
  });
});
