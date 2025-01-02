import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { Role, RolesEnum, User } from '@owl-app/lib-contracts';

import { UserEntitySchema } from '@owl-app/lib-api-module-user-access/database/entity-schema/user.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';
import { uniqueUserFirstName, uniqueUserLastName } from '../unique';

export default class TestUserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<User[]>> {
    const userFactory = await factoryManager.get(UserEntitySchema);

    let usersCreated: User[] = [];
    const promises: Promise<User[]>[] = [];



    Object.values(dataUsers).map((users) =>
      users.map(async (user) => {
        userFactory.setMeta({
          unique: {
            firstName: uniqueUserFirstName,
            lastName: uniqueUserLastName,
            email: user.email,
          },
        });

        promises.push(
          userFactory.saveMany(1, {
            firstName: uniqueUserFirstName,
            lastName: uniqueUserLastName,
            tenant: user.tenant,
            roles: [{ name: RolesEnum.ROLE_USER } as Role],
          })
        );

        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            roles: [{ name: RolesEnum.ROLE_USER } as Role],
          })
        );

        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role],
          })
        );

        promises.push(
          userFactory.saveMany(5, {
            tenant: user.tenant,
            roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role],
          })
        );
      })
    );

    usersCreated = await Promise.all(promises).then((results) => results.flat());

    return usersCreated;
  }
}
