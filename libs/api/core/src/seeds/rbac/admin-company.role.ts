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
  TimeActions,
  Role,
} from '@owl-app/lib-contracts';
import { ROLE_ENTITY } from '@owl-app/lib-api-core/entity-tokens';

import BaseRole from './base.role';

export class AdminCompanyRoleSeeder extends BaseRole {

  getRoleName(): RolesEnum {
    return RolesEnum.ROLE_ADMIN_COMPANY;
  }

  public async run(dataSource: DataSource): Promise<Role> {
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
      ...this.getPermissionsByCollection<typeof CommonActions>(
        AvalilableCollections.PROJECT,
        CommonActions
      ),

      // tag
      ...this.getCrudPermissions(AvalilableCollections.TAG),
      ...this.getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TAG, TagActions),

      // time
      ...this.getCrudPermissions(AvalilableCollections.TIME),
      ...this.getPermissionsByCollection<typeof TimeActions>(AvalilableCollections.TIME, TimeActions),

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

    const createdRole = await repository.save(roleAdmin);

    return createdRole;
  }
}
