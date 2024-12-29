import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  CrudActions,
  RolesEnum,
  Permission,
  PermissionReferType,
} from '@owl-app/lib-contracts';

import { getRouteName } from '@owl-app/lib-api-core/utils/permission';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { PermissionAllSeeder } from '@owl-app/lib-api-core/seeds/permission';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { isStatusSuccess } from '../utils/http';
import {
  uniquePermissionDescription,
  uniquePermissionName,
  uniqueCollectionName,
} from './seeds/unique';
import PermissionSeeder from './seeds/permission/permission.seed';
import permissionSeederFactory from './seeds/permission/permission.factory';

describe('Permission (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  const testData: {
    created: Permission;
  } = {
    created: null,
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'permission',
      seeds: [PermissionSeeder],
      factories: [permissionSeederFactory],
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

  describe('Permission create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PERMISSION,
        CrudActions.CREATE
      );
      const nameCreated = 'CREATED';

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'create' : 'not create'} permission`, async () => {
          const data = {
            name: nameCreated,
            description: 'Test permission',
            collection: uniqueCollectionName,
            refer: PermissionReferType.ROUTE,
          };

          const response = await agentsByRole[role][firstUser.email]
            .post(`/rbac/permissions`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                name: getRouteName(uniqueCollectionName, nameCreated),
              })
            );
            expect(response.body).toMatchObject({
              name: expect.any(String),
              description: expect.any(String),
              collection: expect.any(String),
              refer: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.toBeOneOf([expect.any(String), null]),
            });

            testData.created = response.body;
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email]
              .post(`/rbac/permissions`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                name: expect.any(Array),
                description: expect.any(Array),
                collection: expect.any(Array),
                refer: expect.any(Array),
              },
            });
          });

          it(`should validation error item exist`, async () => {
            const data = {
              name: nameCreated,
              description: 'Test permission validation',
              collection: uniqueCollectionName,
              refer: PermissionReferType.ROUTE,
            };
            const response = await agentsByRole[role][firstUser.email]
              .post(`/rbac/permissions`)
              .send(data);

            expect(response.status).toEqual(400);

            expect(response.body).toMatchObject({
              message: expect.any(String),
              statusCode: expect.any(Number),
            });
          });
        }
      });
    });
  });

  describe('Permission update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PERMISSION,
        CrudActions.UPDATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} permission`, async () => {
          const permission = testServer.context
            .getResultSeed<Permission[]>(PermissionSeeder.name)
            .find((result) => uniquePermissionName !== result.name);
          const data = {
            description: `Updated Permission ${firstUser.email}`,
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/rbac/permissions/${permission.name}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
              })
            );
            expect(response.body).toMatchObject({
              name: expect.any(String),
              description: expect.any(String),
              collection: expect.any(String),
              refer: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.toBeOneOf([expect.any(String), null]),
            });
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const permission = testServer.context
              .getResultSeed<Permission[]>(PermissionSeeder.name)
              .find((result) => uniquePermissionName !== result.name);

            const response = await agentsByRole[role][firstUser.email]
              .put(`/rbac/permissions/${permission.name}`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                description: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });

  describe('Permission list (e2e)', () => {
    let permissionAllResultSeed: Permission[];
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };
    const searchDescription = uniquePermissionDescription.substring(
      0,
      uniquePermissionDescription.lastIndexOf(' ')
    );

    beforeAll(async () => {
      permissionAllResultSeed = testServer.context.getResultSeed<Permission[]>(
        PermissionAllSeeder.name
      );
    });

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PERMISSION,
        CrudActions.LIST
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${
          hasPermission ? 'list' : 'not list'
        } permissions without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/rbac/permissions');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.context.getResultSeed<Permission[]>(
              PermissionSeeder.name
            );

            const count =
              permissionAllResultSeed.length + resultSeed.length + (testData.created ? 1 : 0);

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } permission with filter search by name "${uniquePermissionName}"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/permissions?filters[search][type]=contains&filters[search][value]=${uniquePermissionName}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.context
              .getResultSeed<Permission[]>(PermissionSeeder.name)
              .filter((result) => uniquePermissionName === result.name);

            expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } permission with filter search by description "${searchDescription}"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/permissions?filters[search][type]=contains&filters[search][value]=${searchDescription}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.context
              .getResultSeed<Permission[]>(PermissionSeeder.name)
              .filter((result) => uniquePermissionName === result.name);

            expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${hasPermission ? 'list' : 'not list'} permission with filter refer "${
          PermissionReferType.ROUTE
        }"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/permissions?filters[refer]=${PermissionReferType.ROUTE}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.context
              .getResultSeed<Permission[]>(PermissionSeeder.name)
              .filter((result) => result.refer === PermissionReferType.ROUTE);
            const countPermissionAllResultSeed = permissionAllResultSeed.filter(
              (result) => result.refer === PermissionReferType.ROUTE
            ).length;
            const createdCount = testData?.created.refer === PermissionReferType.ROUTE ? 1 : 0;
            const count = countPermissionAllResultSeed + resultSeed.length + createdCount;

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } permission with filter collection "${uniqueCollectionName}"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/permissions?filters[collection]=${uniqueCollectionName}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.context
              .getResultSeed<Permission[]>(PermissionSeeder.name)
              .filter((result) => result.collection === uniqueCollectionName);
            const createdCount = testData?.created.collection === uniqueCollectionName ? 1 : 0;
            const count = resultSeed.length + createdCount;

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });
      });
    });
  });

  describe('Permission find (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('find by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PERMISSION,
        CrudActions.READ
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'find' : 'not find'} permission`, async () => {
          const permission = testServer.context.getResultSeed<Permission[]>(
            PermissionSeeder.name
          )[0];

          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/permissions/${permission.name}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                name: permission.name,
                description: permission.description,
                collection: permission.collection,
                refer: permission.refer,
                ruleName: permission.ruleName,
              })
            );
            expect(response.body).toMatchObject({
              name: expect.any(String),
              description: expect.any(String),
              collection: expect.any(String),
              refer: expect.any(String),
              ruleName: expect.toBeOneOf([expect.any(String), null]),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            });
          }
        });
      });
    });
  });

  describe('Permission delete (e2e)', () => {
    const deleted: string[] = [];
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(
        role,
        AvalilableCollections.PERMISSION,
        CrudActions.DELETE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'delete' : 'not delete'} permission`, async () => {
          const permission = testServer.context
            .getResultSeed<Permission[]>(PermissionSeeder.name)
            .find((result) => !deleted.includes(result.name));

          const response = await agentsByRole[role][firstUser.email].delete(
            `/rbac/permissions/${permission.name}`
          );

          const expectedStatus = hasPermission ? 202 : 403;

          expect(response.status).toEqual(expectedStatus);

          if (isStatusSuccess(expectedStatus)) {
            deleted.push(permission.name);
          }
        });
      });
    });
  });
});
