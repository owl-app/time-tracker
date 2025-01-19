import { setSeederFactory } from 'typeorm-extension';

import { TestSimpleEntity } from '../__fixtures__/test-simple.entity';

export default setSeederFactory(
  TestSimpleEntity,
  async (faker) => {
    const test = new TestSimpleEntity();

    test.testEntityPk = faker.string.uuid();
    test.stringType = faker.lorem.words(3);
    test.boolType = faker.datatype.boolean();
    test.numberType = faker.number.int();
    test.dateType = faker.date.anytime();

    return test;
  }
);
