import { setSeederFactory } from 'typeorm-extension';

import { allExistPermissions } from '@owl-app/lib-api-core/seeds/data/permission';
import { RoleEntitySchema } from '@owl-app/lib-api-module-rbac/database/entity-schema/role.entity-schema';
import { RoleSettingEntity } from '@owl-app/lib-api-module-rbac/domain/entity/role-setting.entity';
import { RoleEntity } from '@owl-app/lib-api-module-rbac/domain/entity/role.entity';

import { generateWithoutWords } from '../../../utils/unique';

export default setSeederFactory(RoleEntitySchema, (faker, meta: { unique: string }) => {
  const role = new RoleEntity();
  const shufflePermissions = allExistPermissions.sort(() => Math.random() - 0.5);

  if (meta.unique) {
    role.name = `TEST_${generateWithoutWords<number>(faker.word.words, meta.unique.split(/\s+/), 4)
      .replace(/\s+/g, '_')
      .toLocaleUpperCase()}`;
  } else {
    role.name = faker.word.words(4).replace(/\s+/g, '_').toLocaleUpperCase();
  }

  role.description = faker.lorem.words(6);

  const roleSetting = new RoleSettingEntity();
  roleSetting.displayName = faker.lorem.words(3);
  roleSetting.theme = `${faker.lorem.words(1)}/${faker.lorem.words(1)}`;

  role.setting = roleSetting;

  role.permissions = [allExistPermissions[0], shufflePermissions[1], shufflePermissions[3]];

  return role;
});
