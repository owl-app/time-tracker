import { SeederConstructor } from 'typeorm-extension';
import { ConfigService } from '@nestjs/config';

import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import createUserSeeder from '@owl-app/lib-api-core/seeds/user';
import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import {
  AdminSystemRoleSeeder,
  AdminCompanyRoleSeeder,
  UserRoleSeeder,
} from '@owl-app/lib-api-core/seeds/rbac';

export function getSeeds(seeds: SeederConstructor[] = []) {
  return (configService: ConfigService): SeederConstructor[] => {
    const { passwordBcryptSaltRounds } = configService.get<IConfigApp>(APP_CONFIG_NAME);

    return [
      ...seeds,
      ...[
        AdminSystemRoleSeeder,
        AdminCompanyRoleSeeder,
        UserRoleSeeder,
        createUserSeeder(dataUsers, passwordBcryptSaltRounds),
      ],
    ];
  };
}
