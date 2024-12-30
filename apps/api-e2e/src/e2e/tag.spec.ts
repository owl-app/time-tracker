import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Tag,
  CommonActions,
  CrudActions,
  RolesEnum,
  TagActions,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueTagName } from './seeds/unique';
import tagSeederFactory from './seeds/tag/tag.factory';
import TestTagSeeder from './seeds/tag/tag.seed';
import projectSeederFactory from './seeds/project/project.factory';
import { isStatusSuccess } from '../utils/http';
import { hasPermissionAnotherTenant, hasPermissionToArchived } from '../utils/check-permission';

describe('Tag (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    createdByTenant: Record<string, Partial<Tag>[]>;
    createdAll: Partial<Tag>[];
    changedArchived: string[];
  } = {
    createdByTenant: {},
    createdAll: [],
    changedArchived: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'tag',
      seeds: [TestTagSeeder],
      factories: [tagSeederFactory, projectSeederFactory],
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

  describe('Tag create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TAG, CrudActions.CREATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'create' : 'not create'} tag`, async () => {
          const data = {
            name: `Test Tag ${firstUser.email}`,
          };

          const response = await agentsByRole[role][firstUser.email].post(`/tags`).send(data);

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
              color: expect.toBeOneOf([expect.any(String), null]),
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
            const response = await agentsByRole[role][firstUser.email].post(`/tags`).send({});

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

  describe('Tag update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TAG, CrudActions.UPDATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} tag`, async () => {
          const tag = testServer.context
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find(
              (result) => result.tenant.id === firstUser.tenant.id && uniqueTagName !== result.name
            );
          const data = {
            name: `Updated Tag ${firstUser.email}`,
            color: '#06960d',
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/tags/${tag.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(expect.objectContaining(data));
            expect(response.body).toMatchObject({
              id: expect.any(String),
              name: expect.any(String),
              color: expect.toBeOneOf([expect.any(String), null]),
              archived: expect.any(Boolean),
              createdAt: expect.any(String),
              updatedAt: expect.toBeOneOf([expect.any(String), null]),
            });
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'update' : 'not update'
          } tag another tenant`, async () => {
            const tag = testServer.context
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueTagName !== result.name
              );
            const data = {
              name: `Updated Tag ${firstUser.email}`,
              color: '#635e5e',
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/tags/${tag.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(expect.objectContaining(data));
              expect(response.body).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                color: expect.toBeOneOf([expect.any(String), null]),
                archived: expect.any(Boolean),
                createdAt: expect.any(String),
                updatedAt: expect.toBeOneOf([expect.any(String), null]),
              });
            }
          });

          it(`should validation error`, async () => {
            const tag = testServer.context
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find((result) => result.tenant.id === firstUser.tenant.id);

            const response = await agentsByRole[role][firstUser.email]
              .put(`/tags/${tag.id}`)
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

  describe('Tag list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TAG, [
        CrudActions.LIST,
        TagActions.AVAILABLE,
      ]);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} tags without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/tags');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context.getResultSeed<Tag[]>(TestTagSeeder.name);
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
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

        it(`should ${hasPermission ? 'list' : 'not list'} all tags without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/tags?pageable=0');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context.getResultSeed<Tag[]>(TestTagSeeder.name);
              const count = resultSeed.length + testData.createdAll.length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body.items.length).toEqual(count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
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
        } tags with filter archived on active`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            '/tags?filters[archived]=active'
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
                .filter((result) => !result.archived);
              const count =
                resultSeed.length +
                testData.createdAll.filter((created) => !created.archived).length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
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

        it(`should ${hasPermission ? 'list' : 'not list'} tags with filter search`, async () => {
          const search = uniqueTagName.substring(0, uniqueTagName.lastIndexOf(' '));

          const response = await agentsByRole[role][firstUser.email].get(
            `/tags?filters[search][type]=contains&filters[search][value]=${search}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
                .filter((result) => uniqueTagName === result.name);

              expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
              const resultSeed = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
                .filter(
                  (result) =>
                    filterArchived.includes(result.archived) &&
                    result.tenant.id === firstUser.tenant.id &&
                    uniqueTagName === result.name
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

  describe('Tag find (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('find by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TAG, CrudActions.READ);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'find' : 'not find'} tag`, async () => {
          const tag = testServer.context
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const response = await agentsByRole[role][firstUser.email].get(`/tags/${tag.id}`);

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                id: tag.id,
                name: tag.name,
              })
            );
            expect(response.body).toMatchObject({
              id: expect.any(String),
              name: expect.any(String),
              color: expect.toBeOneOf([expect.any(String), null]),
              archived: expect.any(Boolean),
              createdAt: expect.any(String),
              updatedAt: expect.toBeOneOf([expect.any(String), null]),
            });
          }
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'find' : 'not find'
          } tag another tenant`, async () => {
            const tag = testServer.context
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id && uniqueTagName === result.name
              );

            const response = await agentsByRole[role][firstUser.email].get(`/tags/${tag.id}`);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 200 : 404);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  id: tag.id,
                  name: tag.name,
                })
              );
              expect(response.body).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                color: expect.toBeOneOf([expect.any(String), null]),
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

  describe('Tag archive (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('archive by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.TAG,
        CommonActions.ARCHIVE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'archive' : 'not archive'} tag`, async () => {
          const tag = testServer.context
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                !testData.changedArchived.includes(result.id)
            );

          const data = {
            archived: true,
          };

          const response = await agentsByRole[role][firstUser.email]
            .patch(`/tags/archive/${tag.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'archive' : 'not archive'
          } tag another tenant`, async () => {
            const tag = testServer.context
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id &&
                  !testData.changedArchived.includes(result.id)
              );

            const data = {
              archived: true,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/tags/archive/${tag.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);
          });
        }
      });
    });
  });

  describe('Tag restore (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('restore by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.TAG,
        CommonActions.RESTORE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'restore' : 'not restore'} tag`, async () => {
          const tag = testServer.context
            .getResultSeed<Tag[]>(TestTagSeeder.name)
            .find(
              (result) =>
                result.tenant.id === firstUser.tenant.id &&
                !testData.changedArchived.includes(result.id)
            );

          const data = {
            archived: false,
          };

          const response = await agentsByRole[role][firstUser.email]
            .patch(`/tags/archive/${tag.id}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);
        });

        if (hasPermission) {
          it(`should ${
            hasPermissionAnotherTenant(role) ? 'restore' : 'not restore'
          } tag another tenant`, async () => {
            const tag = testServer.context
              .getResultSeed<Tag[]>(TestTagSeeder.name)
              .find(
                (result) =>
                  result.tenant.id !== firstUser.tenant.id &&
                  !testData.changedArchived.includes(result.id)
              );

            const data = {
              archived: false,
            };

            const response = await agentsByRole[role][firstUser.email]
              .patch(`/tags/archive/${tag.id}`)
              .send(data);

            expect(response.status).toEqual(hasPermissionAnotherTenant(role) ? 202 : 404);
          });
        }
      });
    });
  });

  describe('Tag delete (e2e)', () => {
    const deleted: string[] = [];
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.TAG, CrudActions.DELETE);

      describe.each<boolean>([false, true])(
        `role ${role} and user ${firstUser.email}`,
        (archived) => {
          describe(archived ? 'archived' : 'active', () => {
            it(`should ${hasPermission && archived ? 'delete' : 'not delete'} tag`, async () => {
              const tag = testServer.context
                .getResultSeed<Tag[]>(TestTagSeeder.name)
                .find(
                  (result) =>
                    result.tenant.id === firstUser.tenant.id &&
                    result.archived === archived &&
                    !deleted.includes(result.id) &&
                    !testData.changedArchived.includes(result.id)
                );

              const response = await agentsByRole[role][firstUser.email].delete(`/tags/${tag.id}`);

              let expectedStatus;

              if (hasPermission) {
                expectedStatus = archived ? 202 : 404;
              } else {
                expectedStatus = 403;
              }
              expect(response.status).toEqual(expectedStatus);

              if (isStatusSuccess(expectedStatus)) {
                deleted.push(tag.id);
              }
            });
          });

          if (hasPermission) {
            describe(archived ? 'archived' : 'active', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) && hasPermission && archived
                  ? 'delete'
                  : 'not delete'
              } tag another tenant`, async () => {
                const tag = testServer.context
                  .getResultSeed<Tag[]>(TestTagSeeder.name)
                  .find(
                    (result) =>
                      result.tenant.id !== firstUser.tenant.id &&
                      result.archived === archived &&
                      !deleted.includes(result.id) &&
                      !testData.changedArchived.includes(result.id)
                  );

                const response = await agentsByRole[role][firstUser.email].delete(
                  `/tags/${tag.id}`
                );

                let expectedStatus;

                if (archived) {
                  expectedStatus = hasPermissionAnotherTenant(role) ? 202 : 404;
                } else {
                  expectedStatus = 404;
                }

                expect(response.status).toEqual(expectedStatus);

                if (isStatusSuccess(expectedStatus)) {
                  deleted.push(tag.id);
                }
              });
            });
          }
        }
      );
    });
  });
});
