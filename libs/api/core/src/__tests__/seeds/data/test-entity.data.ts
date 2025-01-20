import { shuffle } from 'lodash';
import { plainToClass } from 'class-transformer';
import { faker } from '@faker-js/faker';

import { TestSimpleEntity } from '../../__fixtures__/test-simple.entity';
import { TestBaseEntity } from '../../__fixtures__/test-base.entity';

import { TEST_TENANT_CREATED } from './tenant.data';


export const TEST_SIMPLE_ENTITIES_NEW: Partial<TestSimpleEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
  testEntityPk: faker.string.uuid(),
  stringType: faker.lorem.words(3),
  boolType: faker.datatype.boolean(),
  numberType: faker.number.int(),
  dateType: faker.date.anytime(),
}));


export const TEST_SIMPLE_ENTITIES_CREATED: Partial<TestSimpleEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
  plainToClass(TestSimpleEntity, {
    testEntityPk: faker.string.uuid(),
    stringType: faker.lorem.words(3),
    boolType: faker.datatype.boolean(),
    numberType: faker.number.int(),
    dateType: faker.date.anytime(),
  }
)));

export const TEST_BASE_ENTITIES_NEW: Partial<TestBaseEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
  plainToClass(TestBaseEntity, {
    testEntityPk: faker.string.uuid(),
    stringType: faker.lorem.words(3),
    boolType: faker.datatype.boolean(),
    numberType: faker.number.int(),
    dateType: faker.date.anytime(),
  }
)));

export const TEST_BASE_ENTITIES_CREATED: Partial<TestBaseEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
  plainToClass(TestBaseEntity, {
    testEntityPk: faker.string.uuid(),
    stringType: faker.lorem.words(3),
    boolType: faker.datatype.boolean(),
    numberType: faker.number.int(),
    dateType: faker.date.anytime(),
    tenant: shuffle(TEST_TENANT_CREATED)[0],
  }
)));
