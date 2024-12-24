import TestAgent from 'supertest/lib/agent';
import { SeederEntity } from 'typeorm-extension';

import { TestServer } from '@owl-app/testing';

import {
  AvailableRoles,
  AvalilableCollections,
  Tag,
  CrudActions,
  RolesEnum,
} from '@owl-app/lib-contracts';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import BaseRole from '@owl-app/lib-api-core/seeds/rbac/base.role';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { uniqueTagId, uniqueTagName } from './seeds/unique';
import tagSeederFactory from './seeds/tag/tag.factory';
import TagSeeder from './seeds/tag/tag.seed';
import { CreatedSeedData } from './types';
import { isStatusSuccess, getTestsStatusByOwner, getTestsStatusByRole } from '../utils/http';
import { getCasesByRoleWithOwner } from '../utils/cases';

describe('Tag (e2e)', () => {
  let testServer: TestServer;
  const agentsByRole: Record<RolesEnum, TestAgent> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: null,
    [RolesEnum.ROLE_ADMIN_COMPANY]: null,
    [RolesEnum.ROLE_USER]: null,
  };
  let roleSeeders: SeederEntity[] = [];

  // Local test data used across the test suite
  const testData: {
    created: Record<RolesEnum, Partial<Tag>>;
    countCreated: Record<RolesEnum, number>;
  } = {
    created: {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: {},
      [RolesEnum.ROLE_ADMIN_COMPANY]: {},
      // set it earlier because it will never created
      [RolesEnum.ROLE_USER]: { id: undefined },
    },
    countCreated: {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: 0,
      [RolesEnum.ROLE_ADMIN_COMPANY]: 0,
      [RolesEnum.ROLE_USER]: 0,
    },
  };

  beforeAll(async () => {
    testServer = await createTest({
      dbName: 'tag',
      seeds: [TagSeeder],
      factories: [tagSeederFactory],
    });
    roleSeeders = testServer.context.getSederEntityByClass<SeederEntity[]>([BaseRole]);

    await Promise.all(
      Object.keys(dataUsers).map(async (role) => {
        agentsByRole[role as RolesEnum] = await createAgent(
          testServer.app,
          dataUsers[role as RolesEnum].email
        );
      })
    );
  });

  afterAll(async () => {
    await testServer.close();
  });

  // run first we need data to compare for rest of the tests
  describe('Tag create (e2e)', () => {
    describe.each<RolesEnum>(AvailableRoles)('create by role', (role) => {
      it(`${role} try create tag`, async () => {
        const status = getTestsStatusByRole(
          201,
          AvalilableCollections.TAG,
          CrudActions.CREATE,
          roleSeeders
        );
        const tag = {
          name: `Test Tag ${role}`,
        };
        const response = await agentsByRole[role].post(`/tags`).send(tag);

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
          expect(response.body).toEqual(
            expect.objectContaining({
              ...tag,
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

          // Using as an example for the rest of the tests
          testData.created[role] = response.body;
          if (role !== RolesEnum.ROLE_ADMIN_SYSTEM) {
            testData.countCreated[role] += 1;
            testData.countCreated[RolesEnum.ROLE_ADMIN_SYSTEM] += 1;
          } else {
            testData.countCreated[RolesEnum.ROLE_ADMIN_SYSTEM] += 1;
          }
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
      it(`${role} try validation error`, async () => {
        const status = getTestsStatusByRole(
          422,
          AvalilableCollections.TAG,
          CrudActions.CREATE,
          roleSeeders
        );

        if (status[role] === 403) return;

        const response = await agentsByRole[role].post(`/tags`).send({});

        expect(response.status).toEqual(status[role]);

        expect(response.body).toMatchObject({
          errors: {
            name: expect.any(Array),
          },
        });
      });
    });
  });

  describe('Tag update (e2e)', () => {
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('update by role', (role, roleUpdate, checkOwner) => {
      it(`${role} try update tag ${roleUpdate}`, async () => {
        if (testData.created[roleUpdate]?.id === undefined) return;

        const tag = {
          name: `Updated Tag ${role}`,
          color: '#06960d',
        };
        const status = getTestsStatusByOwner(
          202,
          AvalilableCollections.TAG,
          CrudActions.UPDATE,
          roleSeeders,
          role,
          checkOwner
        );
        const response = await agentsByRole[role]
          .put(`/tags/${testData.created[roleUpdate]?.id}`)
          .send(tag);

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          expect(response.body).toEqual(expect.objectContaining(tag));
          expect(response.body).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            color: expect.toBeOneOf([expect.any(String), null]),
            archived: expect.any(Boolean),
            createdAt: expect.any(String),
            updatedAt: expect.toBeOneOf([expect.any(String), null]),
          });

          // Using as an example for the rest of the tests
          testData.created[roleUpdate] = response.body;
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('validation by role', (role) => {
      it(`${role} try validation error`, async () => {
        const status = getTestsStatusByRole(
          422,
          AvalilableCollections.TAG,
          CrudActions.UPDATE,
          roleSeeders
        );

        if (status[role] === 403) return;

        const response = await agentsByRole[role]
          .put(`/tags/${testData.created[role]?.id}`)
          .send({});

        expect(response.status).toEqual(status[role]);
        expect(response.body).toMatchObject({
          errors: {
            name: expect.any(Array),
          },
        });
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

    describe.each<RolesEnum>(AvailableRoles)('without filters', (role) => {
      it(`${role} try list tags`, async () => {
        const status = getTestsStatusByRole(
          200,
          AvalilableCollections.TAG,
          CrudActions.LIST,
          roleSeeders
        );

        const response = await agentsByRole[role].get('/tags');

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
          const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Tag[]>>(
            TagSeeder.name
          );

          const countClients = resultSeed[role].length + testData.countCreated[role];

          expect(response.body).toHaveProperty('metadata.total', countClients);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<RolesEnum>(AvailableRoles)('with filter archived on active', (role) => {
      it(`${role} try list tags archived`, async () => {
        const status = getTestsStatusByRole(
          200,
          AvalilableCollections.TAG,
          CrudActions.LIST,
          roleSeeders
        );
        const response = await agentsByRole[role].get('/tags?filters[archived]=active');

        expect(response.status).toEqual(status[role]);

        if (isStatusSuccess(status[role])) {
          const resultSeed = testServer.context.getResultSeed<CreatedSeedData<Tag[]>>(
            TagSeeder.name
          );
          const countClients =
            resultSeed[role].filter((tag) => !tag.archived).length + testData.countCreated[role];

          expect(response.body).toHaveProperty('metadata.total', countClients);
          expect(response.body).toHaveProperty('items');
          expect(response.body).toMatchObject(exceptedBodyFormats);
        }
      });
    });

    describe.each<[RolesEnum, number, number]>([
      [RolesEnum.ROLE_ADMIN_SYSTEM, 200, 2],
      [RolesEnum.ROLE_ADMIN_COMPANY, 200, 1],
    ])('with filter search', (user, status, countUsers) => {
      it(`should list tags ${user}`, async () => {
        const search = uniqueTagName.substring(0, uniqueTagName.lastIndexOf(' '));

        const response = await agentsByRole[user].get(
          `/tags?filters[search][type]=contains&filters[search][value]=${search}`
        );

        expect(response.status).toEqual(status);
        expect(response.body).toHaveProperty('metadata.total', countUsers);
        expect(response.body).toHaveProperty('items');
        expect(response.body).toMatchObject(exceptedBodyFormats);
      });
    });
  });

  describe('Tag find (e2e)', () => {
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('find by role', (role, roleFind, checkOwner) => {
      it(`${role} try find tag ${roleFind}`, async () => {
        if (testData.created[roleFind]?.id === undefined) return;

        const status = getTestsStatusByOwner(
          200,
          AvalilableCollections.TAG,
          CrudActions.READ,
          roleSeeders,
          role,
          checkOwner
        );

        const response = await agentsByRole[role].get(`/tags/${testData.created[roleFind]?.id}`);

        expect(response.status).toEqual(status);

        if (isStatusSuccess(status)) {
          expect(response.body).toEqual(expect.objectContaining(testData.created[roleFind]));
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
    });
  });

  describe('Tag archive (e2e)', () => {
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('archive by role', (role, roleArchive, checkOwner) => {
      it(`${role} try archive archive tag ${roleArchive}`, async () => {
        if (testData.created[roleArchive]?.id === undefined) return;

        const status = getTestsStatusByOwner(
          202,
          AvalilableCollections.TAG,
          CrudActions.READ,
          roleSeeders,
          role,
          checkOwner
        );

        const data = {
          archived: true,
        };

        const response = await agentsByRole[role]
          .patch(`/tags/archive/${uniqueTagId[roleArchive]}`)
          .send(data);

        expect(response.status).toEqual(status);
      });
    });
  });

  describe('Tag restore (e2e)', () => {
    describe.each<[RolesEnum, RolesEnum, boolean]>(
      getCasesByRoleWithOwner({
        [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
        [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
      })
    )('archive by role', (role, roleRestore, checkOwner) => {
      it(`${role} try restore tag ${roleRestore}`, async () => {
        if (testData.created[roleRestore]?.id === undefined) return;

        const status = getTestsStatusByOwner(
          202,
          AvalilableCollections.TAG,
          CrudActions.READ,
          roleSeeders,
          role,
          checkOwner
        );

        const data = {
          archived: false,
        };

        const response = await agentsByRole[role]
          .patch(`/tags/archive/${uniqueTagId[roleRestore]}`)
          .send(data);

        expect(response.status).toEqual(status);
      });
    });
  });

  describe('Tag delete (e2e)', () => {
    const deletedClients: string[] = [];

    describe.each<boolean>([false, true])('delete by role', (withArchived) => {
      describe.each<[RolesEnum, RolesEnum, boolean]>(
        getCasesByRoleWithOwner({
          [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_SYSTEM],
          [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY],
        })
      )(withArchived ? 'archived' : 'active', (role, roleDelete, checkOwner) => {
        it(`${role} try delete ${roleDelete} tag`, async () => {
          if (testData.created[roleDelete]?.id === undefined) return;

          const tenantId = dataUsers[roleDelete].tenant.id;
          let status = getTestsStatusByOwner(
            202,
            AvalilableCollections.TAG,
            CrudActions.DELETE,
            roleSeeders,
            role,
            checkOwner
          );
          let clientToDelete: Tag;

          if (withArchived || status === 403) {
            clientToDelete = testServer.context
              .getResultSeed<CreatedSeedData<Tag[]>>(TagSeeder.name)
              [roleDelete].find(
                (tag) =>
                  tenantId === tag.tenant.id && tag.archived && !deletedClients.includes(tag.id)
              );
          } else {
            status = 404;

            clientToDelete = testServer.context
              .getResultSeed<CreatedSeedData<Tag[]>>(TagSeeder.name)
              [roleDelete].find(
                (tag) =>
                  tenantId === tag.tenant.id && !tag.archived && !deletedClients.includes(tag.id)
              );
          }

          const response = await agentsByRole[role].delete(`/tags/${clientToDelete?.id}`);

          expect(response.status).toEqual(status);

          if (isStatusSuccess(status)) {
            deletedClients.push(clientToDelete.id);
          }
        });
      });
    });
  });
});
