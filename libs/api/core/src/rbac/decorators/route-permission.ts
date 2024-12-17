import { SetMetadata } from '@nestjs/common';

export const ROUTE_PERMISSIONS_KEY = 'route_permissions';

export const RoutePermissions = (collection: string, action: string | string[]) => {
  const actions = Array.isArray(action) ? action : [action];

  return SetMetadata(
    ROUTE_PERMISSIONS_KEY,
    actions.map((actionName) => `ROUTE_${collection.toUpperCase()}_${actionName.toUpperCase()}`)
  );
};
