import TestAgent from 'supertest/lib/agent';
import { faker } from '@faker-js/faker';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Tag,
  CrudActions,
  RolesEnum,
  Time,
  Project,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueTimeTrackerDescription } from './seeds/unique';
import tagSeederFactory from './seeds/tag/tag.factory';
import TestTagSeeder from './seeds/tag/tag.seed';
import projectSeederFactory from './seeds/project/project.factory';
import { isStatusSuccess } from '../utils/http';
import { hasPermissionAnotherTenant, hasPermissionAnotherUser } from '../utils/check-permission';
import TestProjectSeeder from './seeds/project/project.seed';
import TestTimeTrackerSeeder from './seeds/time-tracker/time-tracker.seed';
import timeTrackerFactory from './seeds/time-tracker/time-tracker.factory';

describe('Time tracker (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    createdByTenant: Record<string, Partial<Time>[]>;
    createdAll: Partial<Time>[];
    updatedProject: string[];
    updatedTag: string[];
  } = {
    createdByTenant: {},
    createdAll: [],
    updatedProject: [],
    updatedTag: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'time_tracker',
      seeds: [TestProjectSeeder, TestTagSeeder, TestTimeTrackerSeeder],
      factories: [projectSeederFactory, tagSeederFactory, timeTrackerFactory],
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

  describe('Time create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TIME, CrudActions.CREATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${
          hasPermission ? 'create' : 'not create'
        } time with project and tag have the same tenant`, async () => {
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const tag = testServer.seederRegistry
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const data = {
            description: `Test time ${firstUser.email}`,
            timeIntervalStart: faker.date.recent(),
            timeIntervalEnd: faker.date.future(),
            project,
            tags: [tag],
          };
          const response = await agentsByRole[role][firstUser.email].post(`/times`).send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                timeIntervalStart: data.timeIntervalStart.toISOString(),
                timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                project: expect.objectContaining({
                  id: data.project.id,
                  name: data.project.name,
                  archived: data.project.archived,
                }),
                tags: expect.arrayContaining([
                  {
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    archived: tag.archived,
                    createdAt: new Date(tag.createdAt).toISOString(),
                    updatedAt: new Date(tag.updatedAt).toISOString(),
                  },
                ]),
              })
            );

            expect(response.body).toMatchObject({
              id: expect.any(String),
              description: expect.any(String),
              timeIntervalStart: expect.any(String),
              timeIntervalEnd: expect.any(String),
              project: {
                id: expect.any(String),
                name: expect.any(String),
                archived: expect.any(Boolean),
              },
              tags: [
                {
                  id: expect.any(String),
                  name: expect.any(String),
                  color: expect.toBeOneOf([expect.any(String), null]),
                  archived: expect.any(Boolean),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                },
              ],
            });

            testData.createdAll.push({
              ...response.body,
              user: firstUser,
              tenant: !hasPermissionAnotherTenant(role) ? firstUser.tenant : null,
            });
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'create' : 'not create'
          } time with project has different tenant`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              description: `Test time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [] as Tag[],
            };
            const response = await agentsByRole[role][firstUser.email].post(`/times`).send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 201 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: expect.any(Array),
              });

              testData.createdAll.push({
                ...response.body,
                user: firstUser,
                tenant: !hasPermissionAnotherTenant(role) ? firstUser.tenant : null,
              });
            }
          });

          it(`should ${
            hasPermissionAnotherTenant(role) ? 'create' : 'not create'
          } time with tag has different tenant`, async () => {
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);
            const tag = testServer.seederRegistry
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              description: `Test time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [tag],
            };
            const response = await agentsByRole[role][firstUser.email].post(`/times`).send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 201 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                  tags: expect.arrayContaining([
                    {
                      id: tag.id,
                      name: tag.name,
                      color: tag.color,
                      archived: tag.archived,
                      createdAt: new Date(tag.createdAt).toISOString(),
                      updatedAt: new Date(tag.updatedAt).toISOString(),
                    },
                  ]),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: expect.any(Array),
              });

              testData.createdAll.push({
                ...response.body,
                user: firstUser,
                tenant: !hasPermissionAnotherTenant(role) ? firstUser.tenant : null,
              });
            }
          });

          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/times`).send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                project: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });

  describe('Time update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TIME, CrudActions.UPDATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} time`, async () => {
          const time = testServer.seederRegistry
            .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                result.user.id === firstUser.id &&
                uniqueTimeTrackerDescription !== result.description
            );
          const project = testServer.seederRegistry
            .getResultSeed<Project[]>(TestProjectSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const tag = testServer.seederRegistry
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const data = {
            description: `Updated time ${firstUser.email}`,
            timeIntervalStart: faker.date.recent(),
            timeIntervalEnd: faker.date.future(),
            project,
            tags: [tag],
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/times/${time.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                timeIntervalStart: data.timeIntervalStart.toISOString(),
                timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                project: expect.objectContaining({
                  id: data.project.id,
                  name: data.project.name,
                  archived: data.project.archived,
                }),
                tags: expect.arrayContaining([
                  {
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    archived: tag.archived,
                    createdAt: new Date(tag.createdAt).toISOString(),
                    updatedAt: new Date(tag.updatedAt).toISOString(),
                  },
                ]),
              })
            );

            expect(response.body).toMatchObject({
              id: expect.any(String),
              description: expect.any(String),
              timeIntervalStart: expect.any(String),
              timeIntervalEnd: expect.any(String),
              project: {
                id: expect.any(String),
                name: expect.any(String),
                archived: expect.any(Boolean),
              },
              tags: [
                {
                  id: expect.any(String),
                  name: expect.any(String),
                  color: expect.toBeOneOf([expect.any(String), null]),
                  archived: expect.any(Boolean),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                },
              ],
            });

            testData.updatedProject.push(project.id);
            testData.updatedTag.push(tag.id);
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } time with project has different tenant`, async () => {
            const time = testServer.seederRegistry
              .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
              .find(
                (result) =>
                  result.tenant.id === firstUser.tenant.id &&
                  result.user.id === firstUser.id &&
                  uniqueTimeTrackerDescription !== result.description
              );
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              description: `Updated time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [] as Tag[],
            };
            const response = await agentsByRole[role][firstUser.email]
              .put(`/times/${time.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: expect.any(Array),
              });

              testData.updatedProject.push(project.id);
            }
          });

          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } time with tag has different tenant`, async () => {
            const time = testServer.seederRegistry
              .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
              .find(
                (result) =>
                  result.tenant.id === firstUser.tenant.id &&
                  result.user.id === firstUser.id &&
                  uniqueTimeTrackerDescription !== result.description
              );
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);
            const tag = testServer.seederRegistry
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              description: `Updated time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [tag],
            };
            const response = await agentsByRole[role][firstUser.email]
              .put(`/times/${time.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                  tags: expect.arrayContaining([
                    {
                      id: tag.id,
                      name: tag.name,
                      color: tag.color,
                      archived: tag.archived,
                      createdAt: new Date(tag.createdAt).toISOString(),
                      updatedAt: new Date(tag.updatedAt).toISOString(),
                    },
                  ]),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: expect.arrayContaining([
                  {
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    archived: tag.archived,
                    createdAt: new Date(tag.createdAt).toISOString(),
                    updatedAt: new Date(tag.updatedAt).toISOString(),
                  },
                ]),
              });

              testData.updatedProject.push(project.id);
              testData.updatedTag.push(tag.id);
            }
          });

          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } time another tenant`, async () => {
            const time = testServer.seederRegistry
              .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id &&
                  result.user.id !== firstUser.id &&
                  uniqueTimeTrackerDescription !== result.description
              );
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

            const tag = testServer.seederRegistry
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

            const data = {
              description: `Updated time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [tag],
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/times/${time.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                  tags: expect.arrayContaining([
                    {
                      id: tag.id,
                      name: tag.name,
                      color: tag.color,
                      archived: tag.archived,
                      createdAt: new Date(tag.createdAt).toISOString(),
                      updatedAt: new Date(tag.updatedAt).toISOString(),
                    },
                  ]),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: [
                  {
                    id: expect.any(String),
                    name: expect.any(String),
                    color: expect.toBeOneOf([expect.any(String), null]),
                    archived: expect.any(Boolean),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                  },
                ],
              });

              testData.updatedProject.push(project.id);
              testData.updatedTag.push(tag.id);
            }
          });

          it(`should ${
            hasPermissionAnotherUser(role) ? 'update' : 'not update'
          } time another user`, async () => {
            const time = testServer.seederRegistry
              .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
              .find(
                (result) =>
                  result.tenant.id === firstUser.tenant.id &&
                  result.user.id !== firstUser.id &&
                  uniqueTimeTrackerDescription !== result.description
              );
            const project = testServer.seederRegistry
              .getResultSeed<Project[]>(TestProjectSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

            const tag = testServer.seederRegistry
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

            const data = {
              description: `Updated time ${firstUser.email}`,
              timeIntervalStart: faker.date.recent(),
              timeIntervalEnd: faker.date.future(),
              project,
              tags: [tag],
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/times/${time.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherUser(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  ...data,
                  timeIntervalStart: data.timeIntervalStart.toISOString(),
                  timeIntervalEnd: data.timeIntervalEnd.toISOString(),
                  project: expect.objectContaining({
                    id: data.project.id,
                    name: data.project.name,
                    archived: data.project.archived,
                  }),
                  tags: expect.arrayContaining([
                    {
                      id: tag.id,
                      name: tag.name,
                      color: tag.color,
                      archived: tag.archived,
                      createdAt: new Date(tag.createdAt).toISOString(),
                      updatedAt: new Date(tag.updatedAt).toISOString(),
                    },
                  ]),
                })
              );

              expect(response.body).toMatchObject({
                id: expect.any(String),
                description: expect.any(String),
                timeIntervalStart: expect.any(String),
                timeIntervalEnd: expect.any(String),
                project: {
                  id: expect.any(String),
                  name: expect.any(String),
                  archived: expect.any(Boolean),
                },
                tags: [
                  {
                    id: expect.any(String),
                    name: expect.any(String),
                    color: expect.toBeOneOf([expect.any(String), null]),
                    archived: expect.any(Boolean),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                  },
                ],
              });

              testData.updatedProject.push(project.id);
              testData.updatedTag.push(tag.id);
            }
          });

          it(`should validation error`, async () => {
            const time = testServer.seederRegistry
              .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
              .find(
                (result) =>
                  result.tenant.id === firstUser.tenant.id &&
                  result.user.id === firstUser.id &&
                  uniqueTimeTrackerDescription !== result.description
              );

            const response = await agentsByRole[role][firstUser.email]
              .put(`/times/${time.id}`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                project: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });

  describe('Time list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TIME, CrudActions.LIST);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} times without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/times');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.seederRegistry.getResultSeed<Time[]>(
                TestTimeTrackerSeeder.name
              );
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else if (hasPermissionAnotherUser(role)) {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
                .filter((result) => result.tenant.id === firstUser.tenant.id);
              const count =
                resultSeed.length +
                testData.createdAll.filter((created) => created.tenant?.id === firstUser.tenant.id)
                  .length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.seederRegistry
                .getResultSeed<Time[]>(TestTimeTrackerSeeder.name)
                .filter(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id && result.user.id === firstUser.id
                );
              const count =
                resultSeed.length +
                (testData.createdAll.filter(
                  (created) =>
                    created.tenant?.id === firstUser.tenant.id && created.user.id === firstUser.id
                ).length ?? 0);

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

        // it(`should ${
        //   hasPermission ? 'list' : 'not list'
        // } all projects without filters`, async () => {
        //   const response = await agentsByRole[role][firstUser.email].get('/projects?pageable=0');

        //   expect(response.status).toEqual(hasPermission ? 200 : 403);

        //   if (isStatusSuccess(response.status)) {
        //     if (hasPermissionAnotherTenant(role)) {
        //       const resultSeed = testServer.seederRegistry.getResultSeed<Client[]>(TestClientSeeder.name);
        //       const count = resultSeed.length + testData.createdAll.length;

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body.items.length).toEqual(count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter(
        //           (result) =>
        //             filterArchived.includes(result.archived) &&
        //             result.tenant.id === firstUser.tenant.id
        //         );
        //       const count =
        //         resultSeed.length +
        //         (testData.createdByTenant[firstUser.tenant.id].filter((created) =>
        //           filterArchived.includes(created.archived)
        //         ).length ?? 0);

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body.items.length).toEqual(count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     }
        //   }
        // });

        // it(`should ${
        //   hasPermission ? 'list' : 'not list'
        // } projects with filter archived on active`, async () => {
        //   const response = await agentsByRole[role][firstUser.email].get(
        //     '/projects?filters[archived]=active'
        //   );

        //   expect(response.status).toEqual(hasPermission ? 200 : 403);

        //   if (isStatusSuccess(response.status)) {
        //     if (hasPermissionAnotherTenant(role)) {
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => !result.archived);
        //       const count =
        //         resultSeed.length +
        //         testData.createdAll.filter((created) => !created.archived).length;

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => result.tenant.id === firstUser.tenant.id && !result.archived);
        //       const count =
        //         resultSeed.length +
        //         (testData.createdByTenant[firstUser.tenant.id].filter(
        //           (created) => !created.archived
        //         ).length ?? 0);

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     }
        //   }
        // });

        // it(`should ${
        //   hasPermission ? 'list' : 'not list'
        // } projects with filter search`, async () => {
        //   const search = uniqueProjectName.substring(0, uniqueProjectName.lastIndexOf(' '));

        //   const response = await agentsByRole[role][firstUser.email].get(
        //     `/projects?filters[search][type]=contains&filters[search][value]=${search}`
        //   );

        //   expect(response.status).toEqual(hasPermission ? 200 : 403);

        //   if (isStatusSuccess(response.status)) {
        //     if (hasPermissionAnotherTenant(role)) {
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => uniqueProjectName === result.name);

        //       expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter(
        //           (result) =>
        //             filterArchived.includes(result.archived) &&
        //             result.tenant.id === firstUser.tenant.id &&
        //             uniqueProjectName === result.name
        //         );

        //       expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     }
        //   }
        // });

        // it(`should ${
        //   hasPermission ? 'list' : 'not list'
        // } projects with filter client has the same tenant`, async () => {
        //   const { client } = testServer.seederRegistry
        //     .getResultSeed<Project[]>(TestProjectSeeder.name)
        //     .find(
        //       (result) =>
        //         result.tenant.id === firstUser.tenant.id &&
        //         result.name !== uniqueProjectName &&
        //         !testData.updatedClient.includes(result.client.id)
        //     );
        //   const response = await agentsByRole[role][firstUser.email].get(
        //     `/projects?filters[clients]=${client.id}`
        //   );

        //   expect(response.status).toEqual(hasPermission ? 200 : 403);

        //   if (isStatusSuccess(response.status)) {
        //     if (hasPermissionAnotherTenant(role)) {
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => client.id === result.client.id);
        //       const count =
        //         resultSeed.length +
        //         (testData.createdAll.filter((created) => created.client.id === client.id).length ??
        //           0);

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter(
        //           (result) =>
        //             filterArchived.includes(result.archived) && client.id === result.client.id
        //         );
        //       const count =
        //         resultSeed.length +
        //         (testData.createdByTenant[firstUser.tenant.id].filter(
        //           (created) => created.client.id === client.id
        //         ).length ?? 0);

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     }
        //   }
        // });

        // it(`should ${
        //   hasPermission ? 'list' : 'not list'
        // } projects with filter client has different tenant`, async () => {
        //   const { client } = testServer.seederRegistry
        //     .getResultSeed<Project[]>(TestProjectSeeder.name)
        //     .find(
        //       (result) =>
        //         result.tenant.id !== firstUser.tenant.id &&
        //         result.name !== uniqueProjectName &&
        //         !testData.updatedClient.includes(result.client.id)
        //     );
        //   const response = await agentsByRole[role][firstUser.email].get(
        //     `/projects?filters[clients]=${client.id}`
        //   );

        //   expect(response.status).toEqual(hasPermission ? 200 : 403);

        //   if (isStatusSuccess(response.status)) {
        //     if (hasPermissionAnotherTenant(role)) {
        //       const resultSeed = testServer.seederRegistry
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => client.id === result.client.id);
        //       const count =
        //         resultSeed.length +
        //         (testData.createdAll.filter((created) => created.client.id === client.id).length ??
        //           0);

        //       expect(response.body).toHaveProperty('metadata.total', count);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       expect(response.body).toHaveProperty('metadata.total', 0);
        //       expect(response.body).toHaveProperty('items');
        //     }
        //   }
        // });
      });
    });
  });
});
