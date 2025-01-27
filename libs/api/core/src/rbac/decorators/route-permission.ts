import { SetMetadata } from '@nestjs/common';
import { PermissionReferType } from '@owl-app/lib-contracts';

export const ROUTE_PERMISSIONS_KEY = 'route_permissions';

export const RoutePermissions = (collection: string, action: string | string[]) => {
  const actions = Array.isArray(action) ? action : [action];

  return SetMetadata(
    ROUTE_PERMISSIONS_KEY,
    actions.map((actionName) => `${PermissionReferType.ROUTE}_${collection.toUpperCase()}_${actionName.toUpperCase()}`)
  );
};
