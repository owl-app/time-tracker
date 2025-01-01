import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  CrudActions,
  RolesEnum,
  User,
  Role,
} from '@owl-app/lib-contracts';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';
import { RoleSeeder } from '@owl-app/lib-api-core/seeds/role';
import { USER_SEEDER } from '@owl-app/lib-api-core/seeds/user';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { isStatusSuccess } from '../utils/http';

import TestUserSeeder from './seeds/user/user.seed';
import userSeederFactory from './seeds/user/user.factory';
import {
  getPermissionsToUsersByRole,
  hasPermissionAnotherTenant,
  hasPermissionToUsersByRole,
} from '../utils/check-permission';

describe('User (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };
  // data all users seeds/created/updated
  const users: Record<User['id'], Partial<User>> = {};

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

    testServer.context.getResultSeed<User[]>(TestUserSeeder.name).forEach((user) => {
      users[user.id] = user;
    });
    testServer.context.getResultSeed<User[]>(USER_SEEDER).forEach((user) => {
      users[user.id] = user;
    });
  });

  afterAll(async () => {
    await testServer.close();
  });

  describe('User create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.USER, CrudActions.CREATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        describe.each<RolesEnum>(AvailableRoles)('create with role', (roleCreate) => {
          it(`should ${
            hasPermission &&
            hasPermissionToUsersByRole(firstUser.roles[0].name as RolesEnum, roleCreate)
              ? 'create'
              : 'not create'
          } user with role ${roleCreate}`, async () => {
            const roleToCreate = testServer.context
              .getResultSeed<Role[]>(RoleSeeder.name)
              .find((result) => result.name === roleCreate);

            const data = {
              email: faker.internet.email(),
              username: faker.internet.userName(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              phoneNumber: faker.phone.number(),
              password: faker.internet.password(),
              role: roleToCreate,
            };

            const response = await agentsByRole[role][firstUser.email].post(`/users`).send(data);

            let expectedStatus;

            if (!hasPermission) {
              expectedStatus = 403;
            } else {
              expectedStatus = hasPermissionToUsersByRole(
                firstUser.roles[0].name as RolesEnum,
                roleCreate
              )
                ? 201
                : 404;
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
              users[response.body.id] = {
                ...response.body,
                tenant: hasPermissionAnotherTenant(role) ? firstUser.tenant : null,
                roles: [roleToCreate],
              };
            }
          });
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/users`).send({});

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

  describe('User update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.USER, CrudActions.UPDATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        describe.each<RolesEnum>(AvailableRoles)('update with role', (roleCreate) => {
          it(`should ${
            hasPermission &&
            hasPermissionToUsersByRole(firstUser.roles[0].name as RolesEnum, roleCreate)
              ? 'update'
              : 'not update'
          } user with role ${roleCreate}`, async () => {
            const roleToUpdate = testServer.context
              .getResultSeed<Role[]>(RoleSeeder.name)
              .find((result) => result.name === roleCreate);
            const userToUpdate = Object.values(users).find(
              (user) => firstUser.tenant.id === user.tenant.id
            );

            const data = {
              email: faker.internet.email(),
              username: faker.internet.userName(),
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              phoneNumber: faker.phone.number(),
              password: faker.internet.password(),
              role: roleToUpdate,
            };

            const response = await agentsByRole[role][firstUser.email]
              .put(`/users/${userToUpdate.id}`)
              .send(data);

            let expectedStatus;

            if (!hasPermission) {
              expectedStatus = 403;
            } else {
              expectedStatus = hasPermissionToUsersByRole(
                firstUser.roles[0].name as RolesEnum,
                roleCreate
              )
                ? 202
                : 404;
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
                    name: roleToUpdate.name,
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

              users[response.body.id] = {
                ...users[response.body.id],
                roles: [roleToUpdate],
              };
            }
          });

          if (hasPermission) {
            describe('another tenant', () => {
              it(`should ${
                hasPermissionAnotherTenant(role) ? 'update' : 'not update'
              } user another tenant with role ${roleCreate}`, async () => {
                const roleToUpdate = testServer.context
                  .getResultSeed<Role[]>(RoleSeeder.name)
                  .find((result) => result.name === roleCreate);
                const userToUpdate = Object.values(users).find(
                  (user) => firstUser.tenant.id !== user.tenant.id
                );

                const data = {
                  email: faker.internet.email(),
                  username: faker.internet.userName(),
                  firstName: faker.person.firstName(),
                  lastName: faker.person.lastName(),
                  phoneNumber: faker.phone.number(),
                  password: faker.internet.password(),
                  role: roleToUpdate,
                };

                const response = await agentsByRole[role][firstUser.email]
                  .put(`/users/${userToUpdate.id}`)
                  .send(data);

                let expectedStatus;

                if (!hasPermission) {
                  expectedStatus = 403;
                } else {
                  expectedStatus =
                    hasPermissionToUsersByRole(firstUser.roles[0].name as RolesEnum, roleCreate) &&
                    hasPermissionAnotherTenant(role)
                      ? 202
                      : 404;
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
                        name: roleToUpdate.name,
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

                  users[response.body.id] = {
                    ...users[response.body.id],
                    roles: [roleToUpdate],
                  };
                }
              });
            });
          }

          if (
            hasPermission &&
            !hasPermissionToUsersByRole(firstUser.roles[0].name as RolesEnum, roleCreate)
          ) {
            it(`should not update user which has role ${roleCreate}`, async () => {
              const roleToUpdate = testServer.context
                .getResultSeed<Role[]>(RoleSeeder.name)
                .find((result) => result.name === RolesEnum.ROLE_USER);
              const userToUpdate = Object.values(users).find(
                (user) =>
                  firstUser.tenant.id === user.tenant.id && user.roles[0].name === roleCreate
              );

              const data = {
                email: faker.internet.email(),
                username: faker.internet.userName(),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                phoneNumber: faker.phone.number(),
                password: faker.internet.password(),
                role: roleToUpdate,
              };

              const response = await agentsByRole[role][firstUser.email]
                .put(`/users/${userToUpdate.id}`)
                .send(data);

              expect(response.status).toEqual(404);
            });
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/users`).send({});

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

  describe('User list (e2e)', () => {
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.USER, CrudActions.LIST);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} users without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/users');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            if (hasPermissionAnotherTenant(role)) {
              expect(response.body).toHaveProperty('metadata.total', Object.keys(users).length);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            } else {
              const count = Object.values(users).filter(
                (result) =>
                  getPermissionsToUsersByRole(firstUser.roles[0].name as RolesEnum).includes(
                    result.roles[0].name as RolesEnum
                  ) &&
                  result.tenant &&
                  result.tenant.id === firstUser.tenant.id
              ).length;

              expect(response.body).toHaveProperty('metadata.total', count);
              expect(response.body).toHaveProperty('items');
              expect(response.body).toMatchObject(exceptedBodyFormats);
            }
          }
        });

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
        //       const resultSeed = testServer.context
        //         .getResultSeed<Project[]>(TestProjectSeeder.name)
        //         .filter((result) => uniqueProjectName === result.name);

        //       expect(response.body).toHaveProperty('metadata.total', resultSeed.length);
        //       expect(response.body).toHaveProperty('items');
        //       expect(response.body).toMatchObject(exceptedBodyFormats);
        //     } else {
        //       const filterArchived = hasPermissionToArchived(role) ? [false, true] : [false];
        //       const resultSeed = testServer.context
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
      });
    });
  });
});
