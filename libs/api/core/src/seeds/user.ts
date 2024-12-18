import { omit } from 'lodash';
import { DataSource } from 'typeorm';
import { Seeder, SeederConstructor } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

import { Role, User } from '@owl-app/lib-contracts';

import { UserData } from './data/users';
import { USER_ENTITY } from '../entity-tokens';

export default function createUserSeeder(
  dataUsers: UserData,
  passwordBcryptSaltRounds: number
): SeederConstructor {
  return class UserSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
      const users: Partial<User>[] = [];

      await dataSource.transaction(async (manager) => {
          await Promise.all(Object.values(dataUsers).map(async (user) => {
            user.passwordHash = await bcrypt.hash(user.password, passwordBcryptSaltRounds);
            user.roles = user.roles.map((role) => ({ name: role.name } as Role));

            users.push(omit(user, 'password'));
          }))

          await manager.save(USER_ENTITY, users);
      });
    }
  };
}
