import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  CrudActions,
  RolesEnum,
  Permission,
  PermissionReferType,
  User,
  Role,
} from '@owl-app/lib-contracts';

import { getRouteName } from '@owl-app/lib-api-core/utils/permission';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { PermissionSeeder } from '@owl-app/lib-api-core/seeds/permission';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { isStatusSuccess } from '../utils/http';
import {
  uniquePermissionDescription,
  uniquePermissionName,
  uniqueCollectionName,
} from './seeds/unique';
import TestUserSeeder from './seeds/user/user.seed';
import userSeederFactory from './seeds/user/user.factory';
import { RoleSeeder } from '@owl-app/lib-api-core/seeds/role';
import { hasPermissionAnotherTenant, hasPermissionToUsersByRole } from '../utils/check-permission';

describe('User (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  // Local test data used across the test suite
  const testData: {
    createdByTenant: Record<string, Partial<User>[]>;
    createdAll: Partial<User>[];
  } = {
    createdByTenant: {},
    createdAll: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'user',
      seeds: [TestUserSeeder],
      factories: [userSeederFactory],
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
        AvalilableCollections.USER,
        CrudActions.CREATE
      );

      describe(`role ${role} and user ${firstUser.email}`, () => {
        describe.each<RolesEnum>(AvailableRoles)('create by role', (roleCreate) => {
          it(`should ${hasPermission && hasPermissionToUsersByRole((firstUser.roles[0]).name as RolesEnum, roleCreate) ? 'create' : 'not create'} user with role ${roleCreate}`, async () => {
            const roleToCreate = testServer.context
              .getResultSeed<Role[]>(RoleSeeder.name)
              .find(
                (result) =>
                  result.name === roleCreate
              );

            const data = {
              email: faker.internet.email(),
              username: faker.internet.userName(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              phoneNumber: faker.phone.number(),
              password: faker.internet.password(),
              role: roleToCreate
            };

            const response = await agentsByRole[role][firstUser.email]
              .post(`/users`)
              .send(data);

            let expectedStatus;

            if(!hasPermission) {
              expectedStatus = 403;
            } else {
              expectedStatus = hasPermissionToUsersByRole((firstUser.roles[0]).name as RolesEnum, roleCreate) ? 201 : 404;
            }

            expect(response.status).toEqual(expectedStatus);

            if (isStatusSuccess(response.status)) {
              expect(response.body).toEqual(
                expect.objectContaining({
                  email: data.email,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  phoneNumber: data.phoneNumber,
                  role: expect.objectContaining({
                    name: roleToCreate.name,
                  }),
                })
              );
              expect(response.body).toMatchObject({
                email: expect.any(String),
                firstName: expect.any(String),
                lastName: expect.any(String),
                phoneNumber: expect.any(String),
                role: expect.any(Object),
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
        })

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email]
              .post(`/users`)
              .send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                email: expect.any(Array),
                role: expect.any(Array),
                password: expect.any(Array),
              },
            });
          });
        }
      });
    });
  });
});
