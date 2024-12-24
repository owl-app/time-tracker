import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { RolesEnum, Tag } from '@owl-app/lib-contracts';

import { TagEntitySchema } from '@owl-app/lib-api-module-tag/database/entity-schema/tag.entity-schema';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { uniqueTagId, uniqueTagName } from '../unique';
import { CreatedSeedData } from '../../types';

export default class TagSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<Partial<CreatedSeedData<Tag[]>>> {
    const userFactory = await factoryManager.get(TagEntitySchema);

    const adminSystem = [];
    const adminCompany = [];

    userFactory.setMeta({ unique: uniqueTagName });
    adminSystem.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueTagId[RolesEnum.ROLE_ADMIN_SYSTEM],
        name: uniqueTagName,
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        archived: false,
      }))
    );
    adminCompany.push(
      ...(await userFactory.saveMany(1, {
        id: uniqueTagId[RolesEnum.ROLE_ADMIN_COMPANY],
        name: uniqueTagName,
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        archived: false,
      }))
    );

    userFactory.setMeta({});
    // Create 5 archived and 5 active clients for Admin System role
    adminSystem.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_SYSTEM].tenant,
        archived: false,
      }))
    );
    // Create 5 archived and 5 active clients for Admin company role
    adminCompany.push(
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        archived: true,
      })),
      ...(await userFactory.saveMany(5, {
        tenant: dataUsers[RolesEnum.ROLE_ADMIN_COMPANY].tenant,
        archived: false,
      }))
    );

    return {
      [RolesEnum.ROLE_ADMIN_SYSTEM]: [...adminSystem, ...adminCompany],
      [RolesEnum.ROLE_ADMIN_COMPANY]: adminCompany,
    };
  }
}
