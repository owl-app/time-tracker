import { SeederConstructor } from "typeorm-extension";

import RbacSeeder from '@owl-app/lib-api-core/seeds/Rbac';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import createUserSeeder from '@owl-app/lib-api-core/seeds/user';
import { ConfigService } from "@nestjs/config";
import { APP_CONFIG_NAME, IConfigApp } from "@owl-app/lib-api-core/config";

export function getSeeds(seeds: SeederConstructor[] = []) {
  return (configService: ConfigService): SeederConstructor[] => {
    const { passwordBcryptSaltRounds } = configService.get<IConfigApp>(APP_CONFIG_NAME);
  
    return [...seeds, ...[RbacSeeder, createUserSeeder(dataUsers, passwordBcryptSaltRounds)]];
  }
}