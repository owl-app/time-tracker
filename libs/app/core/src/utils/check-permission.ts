import { AvalilableCollections, PermissionReferType } from '@owl-app/lib-contracts';

export const checkPermission = (
  permissions: string[],
  collection: AvalilableCollections,
  action: string,
  referType: PermissionReferType
): boolean =>
  permissions.some(
    (permission) =>
      permission ===
      `${referType.toUpperCase()}_${collection.toUpperCase()}_${action.toUpperCase()}`
  );
