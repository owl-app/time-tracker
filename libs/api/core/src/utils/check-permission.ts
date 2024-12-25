import { AvalilableCollections, PermissionReferType, RolesEnum } from '@owl-app/lib-contracts';
import { RequestContextService } from '../context/app-request-context';
import { dataRoles } from '../seeds/data/role';
import { getRouteName } from './permission';

export const checkPermissionToRoute = (
  collection: AvalilableCollections,
  action: string
): boolean =>
  RequestContextService.getCurrentUser()?.permissions?.routes?.some(
    (permission) =>
      permission ===
      `${PermissionReferType.ROUTE.toUpperCase()}_${collection.toUpperCase()}_${action.toUpperCase()}`
  );

export const roleHasPermission = (role: RolesEnum, collection: AvalilableCollections, action: string): boolean =>
  dataRoles[role].some((permission) => permission.name === getRouteName(collection, action));
