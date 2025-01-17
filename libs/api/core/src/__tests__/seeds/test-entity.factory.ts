import { setSeederFactory } from 'typeorm-extension';

import { TestEntity } from '../fixtures/test.entity';

export default setSeederFactory(
  TestEntity,
  async (faker) => {
    const test = new TestEntity();

    test.testEntityPk = faker.string.uuid();
    test.stringType = faker.lorem.words(3);
    test.boolType = faker.datatype.boolean();
    test.numberType = faker.number.int();
    test.dateType = faker.date.anytime();

    return test;
  }
);
