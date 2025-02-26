import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  CrudActions,
  RolesEnum,
  Role,
  RoleActions,
  Permission,
} from '@owl-app/lib-contracts';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { RoleSeeder } from '@owl-app/lib-api-core/seeds/role';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';
import { PermissionSeeder } from '@owl-app/lib-api-core/seeds/permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { isStatusSuccess } from '../utils/http';
import { uniqueRoleName, uniqueRoleDescription } from './seeds/unique';
import TestRoleSeeder from './seeds/role/role.seed';
import roleSeederFactory from './seeds/role/role.factory';
import { getPermissionsToRoles, hasPermissionToAllRoles } from '../utils/check-permission';

describe('Role (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, Record<string, TestAgent>> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
    [RolesEnum.ROLE_ADMIN_COMPANY]: {},
    [RolesEnum.ROLE_USER]: {},
  };

  const testData: {
    created: Role;
  } = {
    created: null,
  };

  const deleted: string[] = [];

  const permissionNameNotExist = 'ROUTE_NOT_EXIST';

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'role',
      seeds: [TestRoleSeeder],
      factories: [roleSeederFactory],
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

  describe('Role create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, CrudActions.CREATE);
      const nameCreated = 'CREATED';

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'create' : 'not create'} role`, async () => {
          const data = {
            name: nameCreated,
            description: 'Test role',
            setting: {
              displayName: 'Test Role',
              theme: 'light/blue',
            },
          };

          const response = await agentsByRole[role][firstUser.email].post(`/rbac/roles`).send(data);

          expect(response.status).toEqual(hasPermission ? 201 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(expect.objectContaining(data));
            expect(response.body).toMatchObject({
              name: expect.any(String),
              description: expect.any(String),
              setting: {
                displayName: expect.any(String),
                theme: expect.any(String),
              },
            });

            testData.created = response.body;
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const response = await agentsByRole[role][firstUser.email].post(`/rbac/roles`).send({});

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              errors: {
                name: expect.any(Array),
                description: expect.any(Array),
              },
            });
          });

          it(`should validation error item exist`, async () => {
            const data = {
              name: nameCreated,
              description: 'Test permission validation',
              setting: {
                displayName: 'Test Role',
                theme: 'light/blue',
              },
            };
            const response = await agentsByRole[role][firstUser.email]
              .post(`/rbac/roles`)
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

  describe('Role update (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('update by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, CrudActions.UPDATE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'update' : 'not update'} role`, async () => {
          const roleToUpdate = testServer.seederRegistry
            .getResultSeed<Role[]>(TestRoleSeeder.name)
            .find((result) => uniqueRoleName !== result.name);
          const data = {
            description: `Updated Role ${firstUser.email}`,
            setting: {
              displayName: 'Updated Role',
              theme: 'updated/role',
            },
          };

          const response = await agentsByRole[role][firstUser.email]
            .put(`/rbac/roles/${roleToUpdate.name}`)
            .send(data);

          expect(response.status).toEqual(hasPermission ? 202 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(expect.objectContaining(data));
            expect(response.body).toMatchObject({
              description: expect.any(String),
              setting: {
                displayName: expect.any(String),
                theme: expect.any(String),
              },
            });
          }
        });

        if (hasPermission) {
          it(`should validation error`, async () => {
            const roleFromSeed = testServer.seederRegistry
              .getResultSeed<Role[]>(TestRoleSeeder.name)
              .find((result) => uniqueRoleName !== result.name);

            const response = await agentsByRole[role][firstUser.email]
              .put(`/rbac/roles/${roleFromSeed.name}`)
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

  describe('Role list (e2e)', () => {
    let roleAllResultSeed: Role[];
    const exceptedBodyFormats = {
      metadata: {
        total: expect.any(Number),
      },
      items: expect.any(Array),
    };
    const searchDescription = uniqueRoleDescription.substring(
      0,
      uniqueRoleDescription.lastIndexOf(' ')
    );

    beforeAll(async () => {
      roleAllResultSeed = testServer.seederRegistry.getResultSeed<Role[]>(RoleSeeder.name);
    });

    describe.each<RolesEnum>(AvailableRoles)('list by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, [
        CrudActions.LIST,
        RoleActions.AVAILABLE,
      ]);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'list' : 'not list'} roles without filters`, async () => {
          const response = await agentsByRole[role][firstUser.email].get('/rbac/roles');

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            const resultSeed = testServer.seederRegistry.getResultSeed<Role[]>(TestRoleSeeder.name);

            let count;

            if (hasPermissionToAllRoles(role)) {
              count = roleAllResultSeed.length + resultSeed.length + (testData.created ? 1 : 0);
            } else {
              count = roleAllResultSeed.filter((result) =>
                getPermissionsToRoles(role).includes(result.name as RolesEnum)
              ).length;
            }

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } roles with filter search by name "${uniqueRoleName}"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/roles?filters[search][type]=contains&filters[search][value]=${uniqueRoleName}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            let count;

            if (hasPermissionToAllRoles(role)) {
              count = testServer.seederRegistry
                .getResultSeed<Role[]>(TestRoleSeeder.name)
                .filter((result) => uniqueRoleName === result.name).length;
            } else {
              count = roleAllResultSeed.filter(
                (result) =>
                  getPermissionsToRoles(role).includes(result.name as RolesEnum) &&
                  uniqueRoleName === result.name
              ).length;
            }

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });

        it(`should ${
          hasPermission ? 'list' : 'not list'
        } roles with filter search by description "${searchDescription}"`, async () => {
          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/roles?filters[search][type]=contains&filters[search][value]=${searchDescription}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            let count;

            if (hasPermissionToAllRoles(role)) {
              count = testServer.seederRegistry
                .getResultSeed<Role[]>(TestRoleSeeder.name)
                .filter((result) => uniqueRoleName === result.name).length;
            } else {
              count = roleAllResultSeed.filter(
                (result) =>
                  getPermissionsToRoles(role).includes(result.name as RolesEnum) &&
                  uniqueRoleName === result.name
              ).length;
            }

            expect(response.body).toHaveProperty('metadata.total', count);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toMatchObject(exceptedBodyFormats);
          }
        });
      });
    });
  });

  describe('Role find (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('find by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, CrudActions.READ);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'find' : 'not find'} role`, async () => {
          const roleTestSeeder = testServer.seederRegistry.getResultSeed<Role[]>(
            TestRoleSeeder.name
          )[0];

          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/roles/${roleTestSeeder.name}`
          );

          expect(response.status).toEqual(hasPermission ? 200 : 403);

          if (isStatusSuccess(response.status)) {
            expect(response.body).toEqual(
              expect.objectContaining({
                name: roleTestSeeder.name,
                description: roleTestSeeder.description,
                setting: {
                  displayName: roleTestSeeder.setting.displayName,
                  theme: roleTestSeeder.setting.theme,
                },
              })
            );
            expect(response.body).toMatchObject({
              name: expect.any(String),
              description: expect.any(String),
              setting: {
                displayName: expect.any(String),
                theme: expect.any(String),
              },
            });
          }
        });
      });
    });
  });

  describe('Role delete (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('delete by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, CrudActions.DELETE);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'delete' : 'not delete'} role`, async () => {
          const roleTestSeeder = testServer.seederRegistry
            .getResultSeed<Role[]>(TestRoleSeeder.name)
            .find((result) => !deleted.includes(result.name));

          const response = await agentsByRole[role][firstUser.email].delete(
            `/rbac/roles/${roleTestSeeder.name}`
          );

          const expectedStatus = hasPermission ? 202 : 403;

          expect(response.status).toEqual(expectedStatus);

          if (isStatusSuccess(expectedStatus)) {
            deleted.push(roleTestSeeder.name);
          }
        });
      });
    });
  });

  describe('Role assigned permissions (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('assigned permissions by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, RoleActions.ASSIGN);
      const notFoundRoleName = 'NOT_FOUND_ROLE';

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${
          hasPermission ? 'list assigned permissions' : 'not list assigned permissions'
        } role`, async () => {
          const roleTestSeeder = testServer.seederRegistry
            .getResultSeed<Role[]>(TestRoleSeeder.name)
            .find((result) => !deleted.includes(result.name));

          const response = await agentsByRole[role][firstUser.email].get(
            `/rbac/roles/assigned-permissions/${roleTestSeeder.name}`
          );

          const expectedStatus = hasPermission ? 200 : 403;

          expect(response.status).toEqual(expectedStatus);

          if (isStatusSuccess(expectedStatus)) {
            expect(response.body).toEqual(
              expect.arrayContaining(
                roleTestSeeder.permissions.map((permission) => permission.name)
              )
            );
          }
        });

        if (hasPermission) {
          it(`should not found role`, async () => {
            const response = await agentsByRole[role][firstUser.email].get(
              `/rbac/roles/assigned-permissions/${notFoundRoleName}`
            );

            expect(response.status).toEqual(404);

            expect(response.body).toMatchObject({
              message: expect.any(String),
              error: expect.any(String),
              statusCode: expect.any(Number),
            });
          });
        }
      });
    });
  });

  describe('Role assign permissions (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('assign by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, RoleActions.ASSIGN);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'assign' : 'not assign'} role`, async () => {
          const roleTestSeeder = testServer.seederRegistry
            .getResultSeed<Role[]>(TestRoleSeeder.name)
            .find((result) => !deleted.includes(result.name));

          const permissions = testServer.seederRegistry
            .getResultSeed<Permission[]>(PermissionSeeder.name)
            .filter((result) =>
              roleTestSeeder.permissions.every((permission) => permission.name !== result.name)
            );

          const response = await agentsByRole[role][firstUser.email]
            .put(`/rbac/roles/assign/${roleTestSeeder.name}`)
            .send([permissions[0].name, permissions[1].name]);

          const expectedStatus = hasPermission ? 202 : 403;

          expect(response.status).toEqual(expectedStatus);

          if (isStatusSuccess(expectedStatus)) {
            const responseAssignedPermissions = await agentsByRole[role][firstUser.email].get(
              `/rbac/roles/assigned-permissions/${roleTestSeeder.name}`
            );

            expect(responseAssignedPermissions.status).toEqual(200);

            expect(responseAssignedPermissions.body).toEqual(
              expect.arrayContaining([permissions[0].name, permissions[1].name])
            );
          }
        });

        if (hasPermission) {
          it(`should validation error that role already has a child`, async () => {
            const roleTestSeeder = testServer.seederRegistry
              .getResultSeed<Role[]>(TestRoleSeeder.name)
              .find((result) => !deleted.includes(result.name));

            const response = await agentsByRole[role][firstUser.email]
              .put(`/rbac/roles/assign/${roleTestSeeder.name}`)
              .send([roleTestSeeder.permissions[0].name]);

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              message: expect.any(Array),
              error: expect.any(String),
              statusCode: expect.any(Number),
            });

            expect(response.body.message.length).toEqual(1);
          });

          it(`should validation error that child "${permissionNameNotExist}" does not exist`, async () => {
            const roleTestSeeder = testServer.seederRegistry
              .getResultSeed<Role[]>(TestRoleSeeder.name)
              .find((result) => !deleted.includes(result.name));

            const response = await agentsByRole[role][firstUser.email]
              .put(`/rbac/roles/assign/${roleTestSeeder.name}`)
              .send([permissionNameNotExist]);

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              message: expect.any(Array),
              error: expect.any(String),
              statusCode: expect.any(Number),
            });

            expect(response.body.message.length).toEqual(1);
          });
        }
      });
    });
  });

  describe('Role revoke permissions (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('revoke by role', (role) => {
      const firstUser = dataUsers[role][0];
      const hasPermission = roleHasPermission(role, AvalilableCollections.ROLE, RoleActions.ASSIGN);

      describe(`role ${role} and user ${firstUser.email}`, () => {
        it(`should ${hasPermission ? 'revoke' : 'not revoke'} role`, async () => {
          const roleTestSeeder = testServer.seederRegistry
            .getResultSeed<Role[]>(TestRoleSeeder.name)
            .find((result) => !deleted.includes(result.name));

          const response = await agentsByRole[role][firstUser.email]
            .put(`/rbac/roles/revoke/${roleTestSeeder.name}`)
            .send([roleTestSeeder.permissions[0].name, roleTestSeeder.permissions[1].name]);

          const expectedStatus = hasPermission ? 202 : 403;

          expect(response.status).toEqual(expectedStatus);

          if (isStatusSuccess(expectedStatus)) {
            const responseAssignedPermissions = await agentsByRole[role][firstUser.email].get(
              `/rbac/roles/assigned-permissions/${roleTestSeeder.name}`
            );

            expect(responseAssignedPermissions.status).toEqual(200);

            expect(responseAssignedPermissions.body).not.toContain([
              roleTestSeeder.permissions[0].name,
              roleTestSeeder.permissions[1].name,
            ]);
          }
        });

        if (hasPermission) {
          it(`should validation error that child "${permissionNameNotExist}" does not exist`, async () => {
            const roleTestSeeder = testServer.seederRegistry
              .getResultSeed<Role[]>(TestRoleSeeder.name)
              .find((result) => !deleted.includes(result.name));

            const response = await agentsByRole[role][firstUser.email]
              .put(`/rbac/roles/revoke/${roleTestSeeder.name}`)
              .send([permissionNameNotExist]);

            expect(response.status).toEqual(422);

            expect(response.body).toMatchObject({
              message: expect.any(Array),
              error: expect.any(String),
              statusCode: expect.any(Number),
            });

            expect(response.body.message.length).toEqual(1);
          });
        }
      });
    });
  });
});
