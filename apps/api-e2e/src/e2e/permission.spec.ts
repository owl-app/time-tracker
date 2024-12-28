import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  CrudActions,
  RolesEnum,
  Permission,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import TagSeeder from './seeds/tag/tag.seed';
import { isStatusSuccess } from '../utils/http';

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
      const hasPermission = roleHasPermission(role, AvalilableCollections.PERMISSION, CrudActions.CREATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'create' : 'not create'} permission`, async () => {
          const data = {
            name: 'TEST',
            description: 'Test permission',
            collection: 'Permission',
            refer: 'Route',
          };

          const response = await agentsByRole[role][firstUser.email].post(`/rbac/permissions`).send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                ...data,
                name: 'ROUTE_PERMISSION_TEST',
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
            const response = await agentsByRole[role][firstUser.email].post(`/rbac/permissions`).send({});

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
              name: 'TEST',
              description: 'Test permission',
              collection: 'Permission',
              refer: 'Route',
            };
            const response = await agentsByRole[role][firstUser.email].post(`/rbac/permissions`).send(data);

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
});
