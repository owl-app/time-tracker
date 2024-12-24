import { setSeederFactory } from 'typeorm-extension';

import { ClientEntitySchema } from '@owl-app/lib-api-module-client/database/entity-schema/client.entity-schema';
import { ClientEntity } from '@owl-app/lib-api-module-client/domain/entity/client.entity';

import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(ClientEntitySchema, (faker, meta: { unique: string }) => {
  const user = new ClientEntity();

  if (meta.unique) {
    user.name = generateWithoutWords(faker.company.name, meta.unique.split(/\s+/));
  } else {
    user.name = faker.company.name();
  }

  user.archived = faker.datatype.boolean();

  return user;
});
