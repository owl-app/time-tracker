import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  Permission,
  UserActions,
  TimeActions,
  RoleActions,
  TagActions,
  ProjectActions,
  CommonActions,
  RolesEnum,
  Role,
} from '@owl-app/lib-contracts';
import { ROLE_ENTITY } from '@owl-app/lib-api-core/entity-tokens';

import BaseRole from './base.role';

export class AdminSystemRoleSeeder extends BaseRole {

  getRoleName(): RolesEnum {
    return RolesEnum.ROLE_ADMIN_SYSTEM;
  }

  public async run(dataSource: DataSource): Promise<Role> {
    const repository = dataSource.getRepository(ROLE_ENTITY);

    const permissions: Permission[] = [
      ...this.getCrudPermissions(),
      ...this.getPermissionsByCollection<typeof UserActions>(
        AvalilableCollections.USER,
        UserActions
      ),
      ...this.getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TAG, TagActions),
      ...this.getPermissionsByCollection<typeof ProjectActions>(
        AvalilableCollections.PROJECT,
        ProjectActions
      ),
      ...this.getPermissionsByCollection<typeof RoleActions>(
        AvalilableCollections.ROLE,
        RoleActions
      ),
      ...this.getPermissionsByCollection<typeof TimeActions>(
        AvalilableCollections.TIME,
        TimeActions
      ),
      // archive
      ...this.getPermissionsByCollection<typeof CommonActions>(
        AvalilableCollections.CLIENT,
        CommonActions
      ),
      ...this.getPermissionsByCollection<typeof CommonActions>(
        AvalilableCollections.PROJECT,
        CommonActions
      ),
      ...this.getPermissionsByCollection<typeof CommonActions>(
        AvalilableCollections.TAG,
        CommonActions
      ),
    ];

    const roleAdmin = {
      name: RolesEnum.ROLE_ADMIN_SYSTEM,
      description: 'Admin system',
      permissions,
      setting: { displayName: 'Admin system' },
    };

    const createdRole = await repository.save(roleAdmin);

    return createdRole;
  }
}
