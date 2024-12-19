import { SeederConstructor, SeederFactoryItem } from 'typeorm-extension';
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
      ...[
        AdminSystemRoleSeeder,
        AdminCompanyRoleSeeder,
        UserRoleSeeder,
        createUserSeeder(dataUsers, passwordBcryptSaltRounds),
      ],
      ...seeds,
    ];
  };
}

export function getFactoriesSeeds(factories: SeederFactoryItem[] = []) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (configService: ConfigService): SeederFactoryItem[] => [
      ...factories,
    ]
}
