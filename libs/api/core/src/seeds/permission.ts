import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { Permission } from '@owl-app/lib-contracts';

import { PERMISSION_ENITY } from '../entity-tokens';
import { allExistPermissions } from './data/permission';

export class PermissionAllSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<Permission[]> {
    const repository = dataSource.getRepository(PERMISSION_ENITY);

    const createdPermissions = await repository.save(allExistPermissions);

    return createdPermissions;
  }
}
