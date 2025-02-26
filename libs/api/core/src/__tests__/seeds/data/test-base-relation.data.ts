import { shuffle } from 'lodash';
import { plainToClass } from 'class-transformer';
import { faker } from '@faker-js/faker';

import { TestBaseRelation } from '../../__fixtures__/test-base-relation.entity';
import { TEST_BASE_ENTITIES_CREATED } from './tes-base-entity.data';
import { TEST_TENANT_CREATED } from './tenant.data';

export const TEST_BASE_RELATION_CREATED: TestBaseRelation[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
  (i) =>
    plainToClass(TestBaseRelation, {
      testBaseRelationPk: faker.string.uuid(),
      relationName: `test-relation-${i}`,
      testBaseEntity: shuffle(TEST_BASE_ENTITIES_CREATED)[0],
      tenant: TEST_TENANT_CREATED[i - 1],
    })
);

export const TEST_BASE_RELATION_ASSIGNED: TestBaseRelation[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
  (i) =>
    plainToClass(TestBaseRelation, {
      testBaseRelationPk: faker.string.uuid(),
      relationName: `test-relation-assigned-${i}`,
      tenant: TEST_TENANT_CREATED[i - 1],
    })
);
