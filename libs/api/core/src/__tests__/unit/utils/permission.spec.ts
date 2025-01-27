import { AvalilableCollections, CrudActions, PermissionReferType } from "@owl-app/lib-contracts";
import { getCrudPermissions, getRoutePermission, getPermissionsByCollection, getRouteName } from "../../../utils/permission";

describe('#utils', () => {
  describe('Permission Utility Functions', () => {
    describe('getCrudPermissions', () => {
      it('should return CRUD permissions for all collections when no collection name is provided', () => {
        const permissions = getCrudPermissions();
        const collections = Object.values(AvalilableCollections);
        const actions = Object.values(CrudActions);

        expect(permissions.length).toBe(collections.length * actions.length);
        collections.forEach((collection) => {
          actions.forEach((action) => {
            expect(permissions).toContainEqual({
              name: getRouteName(collection, action),
              description: `${collection} ${action.toLowerCase()}`,
              refer: PermissionReferType.ROUTE,
              collection,
            });
          });
        });
      });

      it('should return CRUD permissions for a specific collection', () => {
        const collectionName = AvalilableCollections.CLIENT;
        const permissions = getCrudPermissions(collectionName);
        const actions = Object.values(CrudActions);

        expect(permissions.length).toBe(actions.length);
        actions.forEach((action) => {
          expect(permissions).toContainEqual({
            name: getRouteName(collectionName, action),
            description: `${collectionName} ${action.toLowerCase()}`,
            refer: PermissionReferType.ROUTE,
            collection: collectionName,
          });
        });
      });
    });

    describe('getPermissionsByCollection', () => {
      it('should return permissions for a specific collection and available actions', () => {
        const collection = AvalilableCollections.CLIENT;
        const availableActions = CrudActions;
        const permissions = getPermissionsByCollection(collection, availableActions);

        expect(permissions.length).toBe(Object.keys(availableActions).length);
        Object.values(availableActions).forEach((action) => {
          expect(permissions).toContainEqual({
            name: getRouteName(collection, action),
            description: `${collection} ${action.toLowerCase()}`,
            refer: PermissionReferType.ROUTE,
            collection,
          });
        });
      });
    });

    describe('getRoutePermission', () => {
      it('should return a permission for a specific collection and action', () => {
        const collection = AvalilableCollections.CLIENT;
        const action = CrudActions.CREATE;
        const permission = getRoutePermission(collection, action);

        expect(permission).toEqual({
          name: getRouteName(collection, action),
          description: `${collection} ${action.toLowerCase()}`,
          refer: PermissionReferType.ROUTE,
          collection,
        });
      });
    });

    describe('getRouteName', () => {
      it('should return the correct route name for a collection and action', () => {
        const collection = AvalilableCollections.CLIENT;
        const action = CrudActions.CREATE;
        const routeName = getRouteName(collection, action);

        expect(routeName).toBe(`${PermissionReferType.ROUTE}_${collection}_${action}`.toUpperCase());
      });
    });
  });
});
