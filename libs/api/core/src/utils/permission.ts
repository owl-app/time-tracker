import { AvalilableCollections, CrudActions, Permission, PermissionReferType } from "@owl-app/lib-contracts";

export function getCrudPermissions(collectionName: string = null): Permission[] {
  const permissions: Permission[] = [];
  const collections = collectionName ? [collectionName] : Object.values(AvalilableCollections);

  collections.map(async (valueCollection) => {
    Object.values(CrudActions).forEach((valueAction) => {
      permissions.push({
        name: getRouteName(valueCollection, valueAction),
        description: `${valueCollection} ${valueAction.toLowerCase()}`,
        refer: PermissionReferType.ROUTE,
        collection: valueCollection,
      });
    });
  });

  return permissions;
}

export function getPermissionsByCollection<T>(collection: string, available: T): Permission[] {
  const permissions: Permission[] = [];

  Object.values(available).forEach((valueAction) => {
    permissions.push({
      name: getRouteName(collection, valueAction),
      description: `${collection} ${valueAction.toLowerCase()}`,
      refer: PermissionReferType.ROUTE,
      collection,
    });
  });

  return permissions;
}

export function getRoutePermission(collection: string, action: string): Permission {
  return {
    name: getRouteName(collection, action),
    description: `${collection} ${action.toLowerCase()}`,
    refer: PermissionReferType.ROUTE,
    collection,
  };
}

export function getRouteName(collection: string, action: string): string {
  return `${PermissionReferType.ROUTE}_${collection}_${action}`.toUpperCase();
}
