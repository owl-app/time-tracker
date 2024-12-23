import { SeederEntity } from 'typeorm-extension';

import { Role, RolesEnum } from '@owl-app/lib-contracts';
import BaseRole from '@owl-app/lib-api-core/seeds/rbac/base.role';

export function isStatusSuccess(status: number): boolean {
  return status >= 200 && status < 300;
}

export function getTestsStatusByRole(
  status: number,
  collection: string,
  action: string,
  rolesSeeders: SeederEntity[],
): Record<RolesEnum, number> | null {
  const results: Record<string, number> = {};

  rolesSeeders.forEach((roleSeeder) => {
    if (roleSeeder.instance instanceof BaseRole) {
      const roleName = roleSeeder.instance.getRoleName();
      const routeName = roleSeeder.instance.getRouteName(collection, action);
      const resultSedder = roleSeeder.result as Role;

      if (resultSedder.permissions.some((permission) => permission.name === routeName)) {
        results[roleName] = status;
      } else {
        results[roleName] = 403;
      }
    }
  });

  return results;
}

export function getTestsStatusByOwner(
  status: number,
  collection: string,
  action: string,
  rolesSeeders: SeederEntity[],
  roleName: RolesEnum,
  isOwner = false
): number | null {
  const roleSeeder = rolesSeeders.find((seeder) => {
    if (seeder.instance instanceof BaseRole) {
      return seeder.instance.getRoleName() === roleName;
    }

    return false;
  });

  if (roleSeeder && roleSeeder.instance instanceof BaseRole) {
    const routeName = roleSeeder.instance.getRouteName(collection, action);
    const resultSedder = roleSeeder.result as Role;

    if (resultSedder.permissions.some((permission) => permission.name === routeName)) {
      return !isOwner ? 404 : status;
    }

    return 403;
  }

  return null;
}
