import { omit } from 'lodash';
import { DataSource } from 'typeorm';
import { Seeder, SeederConstructor } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

import { Role, User } from '@owl-app/lib-contracts';

import { UserData } from './data/users';
import { TENANT_ENTITY, USER_ENTITY } from '../entity-tokens';

export const USER_SEEDER = 'UserSeeder';

export default function createUserSeeder(
  dataUsers: UserData,
  passwordBcryptSaltRounds: number
): SeederConstructor {
  return class UserSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<Partial<User>[]> {
      const usersToCreate: Partial<User>[] = [];
      const created: Partial<User>[] = [];
      const savedTenantsIds: string[] = [];
      const allUsers: Partial<User & { password: string }>[] = [];

      Object.values(dataUsers).forEach((users) => users.forEach((user) => allUsers.push(user)));

      await dataSource.transaction(async (manager) => {
        await Promise.all(
          allUsers.map(async (user) => {
            user.passwordHash = await bcrypt.hash(user.password, passwordBcryptSaltRounds);
            user.roles = user.roles.map((role) => ({ name: role.name } as Role));

            if (user.tenant && !savedTenantsIds.includes(user.tenant.id)) {
              savedTenantsIds.push(user.tenant.id);
              await manager.save(TENANT_ENTITY, user.tenant);
            }

            usersToCreate.push(omit(user, 'password'));
          })
        );

        created.push(...(await manager.save(USER_ENTITY, usersToCreate)));
      });

      return created;
    }
  };
}
