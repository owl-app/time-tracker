import * as bcrypt from 'bcrypt';
import { setSeederFactory } from 'typeorm-extension';

import { UserEntitySchema } from '@owl-app/lib-api-module-user-access/database/entity-schema/user.entity-schema';
import { UserEntity } from '@owl-app/lib-api-module-user-access/domain/entity/user.entity';
import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(
  UserEntitySchema,
  async (faker, meta: { unique: { firstName: string; lastName: string; email: string } }) => {
    const user = new UserEntity();

    if (meta.unique) {
      user.firstName = generateWithoutWords(
        faker.person.firstName,
        meta.unique.firstName.split(/\s+/)
      );
      user.lastName = generateWithoutWords(
        faker.person.lastName,
        meta.unique.lastName.split(/\s+/)
      );
      user.email = generateWithoutWords(faker.internet.email, meta.unique.lastName.split(/\s+/));
    } else {
      user.firstName = faker.person.firstName();
      user.lastName = faker.person.lastName();
      user.email = faker.internet.email();
    }

    user.username = faker.internet.userName();
    user.phoneNumber = faker.phone.number();
    user.passwordHash = await bcrypt.hash(faker.internet.password(), 12);

    return user;
  }
);
