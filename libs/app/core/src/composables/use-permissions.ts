import { AvalilableCollections, PermissionReferType } from '@owl-app/lib-contracts';
import { usePermissionsStore } from '../stores/permissions';

export type UsablePermissions = {
  hasRoutePermission: (action: string, collectionScope?: AvalilableCollections) => boolean;
  hasFiledPermission: (action: string, collectionScope?: AvalilableCollections) => boolean;
};

export function usePermissions(collection?: AvalilableCollections): UsablePermissions {
  const permissionStore = usePermissionsStore();

  const hasPermission =
    (referType: PermissionReferType) =>
    (permission: string, collectionScope?: AvalilableCollections) => {
      const currentCollection = collectionScope || collection;

      if (!currentCollection) {
        throw new Error('Collection is required');
      }

      const existPermission = permissionStore.getPermission(
        currentCollection,
        permission,
        referType
      );

      if (!existPermission) {
        return false;
      }

      return true;
    };

  return {
    hasRoutePermission: hasPermission(PermissionReferType.ROUTE),
    hasFiledPermission: hasPermission(PermissionReferType.FIELD),
  };
}
