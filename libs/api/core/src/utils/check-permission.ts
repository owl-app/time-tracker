import { AvalilableCollections, PermissionReferType } from '@owl-app/lib-contracts';
import { RequestContextService } from '../context/app-request-context';

export const checkPermissionToRoute = (
  collection: AvalilableCollections,
  action: string
): boolean =>
  RequestContextService.getCurrentUser()?.permissions?.routes?.some(
    (permission) =>
      permission ===
      `${PermissionReferType.ROUTE.toUpperCase()}_${collection.toUpperCase()}_${action.toUpperCase()}`
  );
