import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import { ROLE_ENTITY } from '@owl-app/lib-api-core/entity-tokens';
import {
  AvalilableCollections,
  PermissionReferType,
  CrudActions,
  Permission,
  UserActions,
  TimeActions,
  RoleActions,
  TagActions,
  ProjectActions,
  CommonActions,
} from '@owl-app/lib-contracts';

export default class RbacSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
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
      name: 'ROLE_ADMIN_SYSTEM',
      description: 'Admin role',
      permissions,
      setting: { displayName: 'Admin' },
    };

    await repository.save(roleAdmin);
  }

  private getCrudPermissions(): Permission[] {
    const permissions: Permission[] = [];

    Object.values(AvalilableCollections).map(async (valueCollection) => {
      Object.values(CrudActions).forEach((valueAction) => {
        permissions.push({
          name: this.getRouteName(valueCollection, valueAction),
          description: `${valueCollection} ${valueAction.toLowerCase()}`,
          refer: PermissionReferType.ROUTE,
          collection: valueCollection,
        });
      });
    });

    return permissions;
  }

  private getPermissionsByCollection<T>(collection: string, available: T): Permission[] {
    const permissions: Permission[] = [];

    Object.values(available).forEach((valueAction) => {
      permissions.push({
        name: this.getRouteName(collection, valueAction),
        description: `${collection} ${valueAction.toLowerCase()}`,
        refer: PermissionReferType.ROUTE,
        collection,
      });
    });

    return permissions;
  }

  private getRouteName(collection: string, action: string): string {
    return `${PermissionReferType.ROUTE}_${collection}_${action}`.toUpperCase();
  }
}
