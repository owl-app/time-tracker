import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';

import {
  AvalilableCollections,
  PermissionReferType,
  CrudActions,
  Permission,
  Role,
  RolesEnum,
} from '@owl-app/lib-contracts';
import { RoleSeeder } from './role.seeder';

export default abstract class BaseRole implements Seeder, RoleSeeder {
  abstract run(dataSource: DataSource): Promise<Role>;

  abstract getRoleName(): RolesEnum;

  getRouteName(collection: string, action: string): string {
    return `${PermissionReferType.ROUTE}_${collection}_${action}`.toUpperCase();
  }

  protected getCrudPermissions(collectionName: string = null): Permission[] {
    const permissions: Permission[] = [];
    const collections = collectionName ? [collectionName] : Object.values(AvalilableCollections);

    collections.map(async (valueCollection) => {
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

  protected getPermissionsByCollection<T>(collection: string, available: T): Permission[] {
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

  protected getRoutePermission(collection: string, action: string): Permission {
    return {
      name: this.getRouteName(collection, action),
      description: `${collection} ${action.toLowerCase()}`,
      refer: PermissionReferType.ROUTE,
      collection,
    };
  }
}
