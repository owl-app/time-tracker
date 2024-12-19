import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  Permission,
  UserActions,
  RoleActions,
  TagActions,
  ProjectActions,
  CommonActions,
  RolesEnum,
} from '@owl-app/lib-contracts';
import { ROLE_ENTITY } from '@owl-app/lib-api-core/entity-tokens';

import BaseRole from './base.role';

export class AdminCompanyRoleSeeder extends BaseRole {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(ROLE_ENTITY);

    const permissions: Permission[] = [
      // client
      ...this.getCrudPermissions(AvalilableCollections.CLIENT),
      ...this.getPermissionsByCollection<typeof CommonActions>(
        AvalilableCollections.CLIENT,
        CommonActions
      ),

      // project
      ...this.getCrudPermissions(AvalilableCollections.PROJECT),
      ...this.getPermissionsByCollection<typeof ProjectActions>(
        AvalilableCollections.PROJECT,
        ProjectActions
      ),

      // tag
      ...this.getCrudPermissions(AvalilableCollections.TAG),
      ...this.getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TAG, TagActions),

      // time
      ...this.getCrudPermissions(AvalilableCollections.TIME),
      ...this.getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TIME, TagActions),

      // user
      ...this.getCrudPermissions(AvalilableCollections.USER),
      ...this.getPermissionsByCollection<typeof UserActions>(
        AvalilableCollections.USER,
        UserActions
      ).filter(
        (permission) =>
          permission.name !==
          this.getRouteName(AvalilableCollections.USER, UserActions.ASSIGN_ACCESS)
      ),

      // role
      this.getRoutePermission(AvalilableCollections.ROLE, RoleActions.AVAILABLE),
    ];

    const roleAdmin = {
      name: RolesEnum.ROLE_ADMIN_COMPANY,
      description: 'Admin company',
      permissions,
      setting: { displayName: 'Admin company' },
    };

    await repository.save(roleAdmin);
  }
}
