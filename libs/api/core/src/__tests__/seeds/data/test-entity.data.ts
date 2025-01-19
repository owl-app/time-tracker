import { faker } from '@faker-js/faker';
import { TestSimpleEntity } from '../../__fixtures__/test-simple.entity';

export const TEST_ENTITIES: Partial<TestSimpleEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
  testEntityPk: faker.string.uuid(),
  stringType: faker.lorem.words(3),
  boolType: faker.datatype.boolean(),
  numberType: faker.number.int(),
  dateType: faker.date.anytime(),
}));
