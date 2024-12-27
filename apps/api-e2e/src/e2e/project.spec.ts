import TestAgent from 'supertest/lib/agent';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Project,
  CrudActions,
  RolesEnum,
  Client,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { roleHasPermission } from '@owl-app/lib-api-core/utils/check-permission';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import clientSeederFactory from './seeds/client/client.factory';
import ClientSeeder from './seeds/client/client.seed';
import projectSeederFactory from './seeds/project/project.factory';
import ProjectSeeder from './seeds/project/project.seed';
import { isStatusSuccess } from '../utils/http';
import { hasPermissionAnotherTenant } from '../utils/check-permission';

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
  } = {
    createdByTenant: {},
    createdAll: [],
    changedArchived: [],
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'project',
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
        } project with client has the same tenant`, async () => {
          const client = testServer.context
            .getResultSeed<Client[]>(ClientSeeder.name)
            .find((result) => result.tenant.id === firstUser.tenant.id);

          const data = {
            name: `Test Project ${firstUser.email}`,
            client: client ?? { id: 'not-exist', name: 'Not exist' },
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
          } project with client has other tenant`, async () => {
            const client = testServer.context
              .getResultSeed<Client[]>(ClientSeeder.name)
              .find((result) => result.tenant.id !== firstUser.tenant.id);

            const data = {
              name: `Test Project ${firstUser.email}`,
              client: client ?? { id: 'not-exist', name: 'Not exist' },
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
        }
      });
    });

    // describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
    //   it(`${role} try validation error`, async () => {
    //     const status = getTestsStatusByRole(
    //       422,
    //       AvalilableCollections.PROJECT,
    //       CrudActions.CREATE,
    //       roleSeeders
    //     );

    //     if (status[role] === 403) return;

    //     const response = await agentsByRole[role].post(`/projects`).send({});

    //     expect(response.status).toEqual(status[role]);

    //     expect(response.body).toMatchObject({
    //       errors: {
    //         name: expect.any(Array),
    //       },
    //     });
    //   });
    // });
  });

  // describe('Project update (e2e)', () => {
  //   describe.each<[RolesEnum, RolesEnum, boolean]>(
  //     getCasesByRoleWithOwner({
  //       [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //       [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //     })
  //   )('update by role', (role, roleUpdate, checkOwner) => {
  //     it(`${role} try update project ${roleUpdate}`, async () => {
  //       if (testData.created[roleUpdate]?.id === undefined) return;

  //       const project = {
  //         name: `Updated Project ${role}`,
  //         email: 'test@wp.pl',
  //         address: 'Test address',
  //         description: 'Test description',
  //       };
  //       const status = getTestsStatusByOwner(
  //         202,
  //         AvalilableCollections.PROJECT,
  //         CrudActions.UPDATE,
  //         roleSeeders,
  //         role,
  //         checkOwner
  //       );
  //       const response = await agentsByRole[role]
  //         .put(`/projects/${testData.created[roleUpdate]?.id}`)
  //         .send(project);

  //       expect(response.status).toEqual(status);

  //       if (isStatusSuccess(status)) {
  //         expect(response.body).toEqual(expect.objectContaining(project));
  //         expect(response.body).toMatchObject({
  //           id: expect.any(String),
  //           name: expect.any(String),
  //           email: expect.toBeOneOf([expect.any(String), null]),
  //           address: expect.toBeOneOf([expect.any(String), null]),
  //           description: expect.toBeOneOf([expect.any(String), null]),
  //           archived: expect.any(Boolean),
  //           createdAt: expect.any(String),
  //           updatedAt: expect.toBeOneOf([expect.any(String), null]),
  //         });

  //         // Using as an example for the rest of the tests
  //         testData.created[roleUpdate] = response.body;
  //       }
  //     });
  //   });

  //   describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
  //     it(`${role} try validation error`, async () => {
  //       const status = getTestsStatusByRole(
  //         422,
  //         AvalilableCollections.PROJECT,
  //         CrudActions.UPDATE,
  //         roleSeeders
  //       );

  //       if (status[role] === 403) return;

  //       const response = await agentsByRole[role]
  //         .put(`/projects/${testData.created[role]?.id}`)
  //         .send({});

  //       expect(response.status).toEqual(status[role]);
  //       expect(response.body).toMatchObject({
  //         errors: {
  //           name: expect.any(Array),
  //           email: expect.any(Array),
  //         },
  //       });
  //     });
  //   });
  // });

  // describe('Project list (e2e)', () => {
  //   const exceptedBodyFormats = {
  //     metadata: {
  //       total: expect.any(Number),
  //     },
  //     items: expect.any(Array),
  //   };

  //   describe.each<RolesEnum>(AvailableRoles)('without filters', (role) => {
  //     it(`${role} try list projects`, async () => {
  //       const status = getTestsStatusByRole(
  //         200,
  //         AvalilableCollections.PROJECT,
  //         CrudActions.LIST,
  //         roleSeeders
  //       );

  //       const response = await agentsByRole[role].get('/projects');

  //       expect(response.status).toEqual(status[role]);

  //       if (isStatusSuccess(status[role])) {
  //         const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
  //           ClientSeeder.name
  //         );

  //         const countClients = resultSeed[role].length + testData.countCreated[role];

  //         expect(response.body).toHaveProperty('metadata.total', countClients);
  //         expect(response.body).toHaveProperty('items');
  //         expect(response.body).toMatchObject(exceptedBodyFormats);
  //       }
  //     });
  //   });

  //   describe.each<RolesEnum>(AvailableRoles)('with filter archived on active', (role) => {
  //     it(`${role} try list projects archived`, async () => {
  //       const status = getTestsStatusByRole(
  //         200,
  //         AvalilableCollections.PROJECT,
  //         CrudActions.LIST,
  //         roleSeeders
  //       );
  //       const response = await agentsByRole[role].get('/projects?filters[archived]=active');

  //       expect(response.status).toEqual(status[role]);

  //       if (isStatusSuccess(status[role])) {
  //         const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
  //           ClientSeeder.name
  //         );
  //         const countClients =
  //           resultSeed[role].filter((project) => !project.archived).length +
  //           testData.countCreated[role];

  //         expect(response.body).toHaveProperty('metadata.total', countClients);
  //         expect(response.body).toHaveProperty('items');
  //         expect(response.body).toMatchObject(exceptedBodyFormats);
  //       }
  //     });
  //   });

  //   describe.each<[RolesEnum, number, number]>([
  //     [RolesEnum.ROLE_ADMIN_SYSTEM, 200, 2],
  //     [RolesEnum.ROLE_ADMIN_COMPANY, 200, 1],
  //   ])('with filter search', (user, status, countUsers) => {
  //     it(`should list projects ${user}`, async () => {
  //       const search = uniqueClientName.substring(0, uniqueClientName.lastIndexOf(' '));

  //       const response = await agentsByRole[user].get(
  //         `/projects?filters[search][type]=contains&filters[search][value]=${search}`
  //       );

  //       expect(response.status).toEqual(status);
  //       expect(response.body).toHaveProperty('metadata.total', countUsers);
  //       expect(response.body).toHaveProperty('items');
  //       expect(response.body).toMatchObject(exceptedBodyFormats);
  //     });
  //   });
  // });

  // describe('Project find (e2e)', () => {
  //   describe.each<[RolesEnum, RolesEnum, boolean]>(
  //     getCasesByRoleWithOwner({
  //       [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //       [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //     })
  //   )('find by role', (role, roleFind, checkOwner) => {
  //     it(`${role} try find project ${roleFind}`, async () => {
  //       if (testData.created[roleFind]?.id === undefined) return;

  //       const status = getTestsStatusByOwner(
  //         200,
  //         AvalilableCollections.PROJECT,
  //         CrudActions.READ,
  //         roleSeeders,
  //         role,
  //         checkOwner
  //       );

  //       const response = await agentsByRole[role].get(
  //         `/projects/${testData.created[roleFind]?.id}`
  //       );

  //       expect(response.status).toEqual(status);

  //       if (isStatusSuccess(status)) {
  //         expect(response.body).toEqual(
  //           expect.objectContaining(testData.created[roleFind])
  //         );
  //         expect(response.body).toMatchObject({
  //           id: expect.any(String),
  //           name: expect.any(String),
  //           email: expect.toBeOneOf([expect.any(String), null]),
  //           address: expect.toBeOneOf([expect.any(String), null]),
  //           description: expect.toBeOneOf([expect.any(String), null]),
  //           archived: expect.any(Boolean),
  //           createdAt: expect.any(String),
  //           updatedAt: expect.toBeOneOf([expect.any(String), null]),
  //         });
  //       }
  //     });
  //   });
  // });

  // describe('Project archive (e2e)', () => {
  //   describe.each<boolean>([false, true])('archive by role', (withProjects) => {
  //     describe.each<[RolesEnum, RolesEnum, boolean]>(
  //       getCasesByRoleWithOwner({
  //         [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //         [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //       })
  //     )(withProjects ? 'with projects' : 'without projects', (role, roleArchive, checkOwner) => {
  //       it(`${role} archive archive project ${roleArchive}`, async () => {
  //         if (testData.created[roleArchive]?.id === undefined) return;

  //         const status = getTestsStatusByOwner(
  //           202,
  //           AvalilableCollections.PROJECT,
  //           CrudActions.READ,
  //           roleSeeders,
  //           role,
  //           checkOwner
  //         );

  //         const data = {
  //           archived: true,
  //           withProjects,
  //         };

  //         const response = await agentsByRole[role]
  //           .patch(`/projects/archive/${uniqueClientId[roleArchive]}`)
  //           .send(data);

  //         expect(response.status).toEqual(status);

  //         if (isStatusSuccess(status)) {
  //           // check count active projects
  //           const filterClientId = uniqueClientId[roleArchive];
  //           const responseProjects = await agentsByRole[role].get(
  //             `/projects?filters[archived]=all&filters[projects]=${filterClientId}&limit=25`
  //           );

  //           const activeProjects = responseProjects.body.items.filter(
  //             (project: Project) => !project.archived
  //           );
  //           const archivedProjects = responseProjects.body.items.filter(
  //             (project: Project) => project.archived
  //           );
  //           const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
  //             ProjectSeeder.name
  //           );
  //           let resultSeedCountProjectsActive = 0;
  //           let resultSeedCountProjectsArchived = 0;

  //           if (withProjects) {
  //             resultSeedCountProjectsActive = 0;
  //             resultSeedCountProjectsArchived = resultSeed[role].filter(
  //               (project) => project.project.id === filterClientId
  //             ).length;
  //           } else {
  //             resultSeedCountProjectsActive = resultSeed[role].filter(
  //               (project) => !project.archived && project.project.id === filterClientId
  //             ).length;
  //             resultSeedCountProjectsArchived = resultSeed[role].filter(
  //               (project) => project.archived && project.project.id === filterClientId
  //             ).length;
  //           }

  //           expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
  //           expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
  //         }
  //       });
  //     });
  //   });
  // });

  // describe('Project restore (e2e)', () => {
  //   describe.each<boolean>([false, true])('restore by role', (withProjects) => {
  //     describe.each<[RolesEnum, RolesEnum, boolean]>(
  //       getCasesByRoleWithOwner({
  //         [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //         [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //       })
  //     )(withProjects ? 'with projects' : 'without projects', (role, roleRestore, checkOwner) => {
  //       it(`${role} try restore project ${roleRestore}`, async () => {
  //         if (testData.created[roleRestore]?.id === undefined) return;

  //         const status = getTestsStatusByOwner(
  //           202,
  //           AvalilableCollections.PROJECT,
  //           CrudActions.READ,
  //           roleSeeders,
  //           role,
  //           checkOwner
  //         );

  //         const data = {
  //           archived: false,
  //           withProjects,
  //         };

  //         const response = await agentsByRole[role]
  //           .patch(`/projects/archive/${uniqueClientId[roleRestore]}`)
  //           .send(data);

  //         expect(response.status).toEqual(status);

  //         if (isStatusSuccess(status)) {
  //           // check count active projects
  //           const filterClientId = uniqueClientId[roleRestore];
  //           const responseProjects = await agentsByRole[role].get(
  //             `/projects?filters[archived]=all&filters[projects]=${filterClientId}&limit=25`
  //           );

  //           const activeProjects = responseProjects.body.items.filter(
  //             (project: Project) => !project.archived
  //           );
  //           const archivedProjects = responseProjects.body.items.filter(
  //             (project: Project) => project.archived
  //           );
  //           const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Project[]>>(
  //             ProjectSeeder.name
  //           );
  //           let resultSeedCountProjectsActive = 0;
  //           let resultSeedCountProjectsArchived = 0;

  //           if (withProjects) {
  //             resultSeedCountProjectsActive = resultSeed[role].filter(
  //               (project) => project.project.id === filterClientId
  //             ).length;
  //             resultSeedCountProjectsArchived = 0;
  //           } else {
  //             resultSeedCountProjectsActive = 0;
  //             resultSeedCountProjectsArchived = resultSeed[role].filter(
  //               (project) => project.project.id === filterClientId
  //             ).length;
  //           }

  //           expect(activeProjects.length).toEqual(resultSeedCountProjectsActive);
  //           expect(archivedProjects.length).toEqual(resultSeedCountProjectsArchived);
  //         }
  //       });
  //     });
  //   });
  // });

  // describe('Project delete (e2e)', () => {
  //   const deletedClients: string[] = [];

  //   describe.each<boolean>([false, true])('delete by role', (withArchived) => {
  //     describe.each<[RolesEnum, RolesEnum, boolean]>(
  //       getCasesByRoleWithOwner({
  //         [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
  //         [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
  //       })
  //     )(withArchived ? 'archived' : 'active', (role, roleDelete, checkOwner) => {
  //       it(`${role} try delete ${roleDelete} project`, async () => {
  //         if (testData.created[roleDelete]?.id === undefined) return;

  //         const tenantId = dataUsers[roleDelete].tenant.id;
  //         let status = getTestsStatusByOwner(
  //           202,
  //           AvalilableCollections.PROJECT,
  //           CrudActions.DELETE,
  //           roleSeeders,
  //           role,
  //           checkOwner
  //         );
  //         let clientToDelete: Project;

  //         if (withArchived || status === 403) {
  //           clientToDelete = testServer.context
  //             .getResultSeed<CreatedSeedData<Project[]>>(ClientSeeder.name)
  //             [roleDelete].find(
  //               (project) =>
  //                 tenantId === project.tenant.id &&
  //                 project.archived &&
  //                 !deletedClients.includes(project.id)
  //             );
  //         } else {
  //           status = 404;

  //           clientToDelete = testServer.context
  //             .getResultSeed<CreatedSeedData<Project[]>>(ClientSeeder.name)
  //             [roleDelete].find(
  //               (project) =>
  //                 tenantId === project.tenant.id &&
  //                 !project.archived &&
  //                 !deletedClients.includes(project.id)
  //             );
  //         }

  //         const response = await agentsByRole[role].delete(`/projects/${clientToDelete?.id}`);

  //         expect(response.status).toEqual(status);

  //         if (isStatusSuccess(status)) {
  //           deletedClients.push(clientToDelete.id);
  //         }
  //       });
  //     });
  //   });
  // });
});
