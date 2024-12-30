import * as bcrypt from 'bcrypt';
import { setSeederFactory } from 'typeorm-extension';

import { UserEntitySchema } from '@owl-app/lib-api-module-user-access/database/entity-schema/user.entity-schema';
import { UserEntity } from '@owl-app/lib-api-module-user-access/domain/entity/user.entity';

export default setSeederFactory(UserEntitySchema, async (faker, meta: { unique: string }) => {
  const user = new UserEntity();

  user.email = faker.internet.email();
  user.username = faker.internet.userName();
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.phoneNumber = faker.phone.number();
  user.passwordHash = await bcrypt.hash(faker.internet.password(), 12);

  return user;
});
