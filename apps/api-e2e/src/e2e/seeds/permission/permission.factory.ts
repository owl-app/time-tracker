import { setSeederFactory } from 'typeorm-extension';

import { PermissionEntitySchema } from '@owl-app/lib-api-module-rbac/database/entity-schema/permission.entity-schema';
import { PermissionEntity } from '@owl-app/lib-api-module-rbac/domain/entity/permission.entity';

import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(PermissionEntitySchema, (faker, meta: { unique: string }) => {
  const permission = new PermissionEntity();

  if (meta.unique) {
    permission.name = generateWithoutWords(faker.company.name, meta.unique.split(/\s+/));
  } else {
    permission.description = faker.word.words(4);
    permission.name = permission.description.replace(/\s+/g, '_').toLocaleUpperCase();
  }

  return permission;
});
