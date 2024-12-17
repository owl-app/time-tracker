import { defineStore } from 'pinia';

import { AvalilableCollections, PermissionReferType } from '@owl-app/lib-contracts';

import api from '../services/api';
import { checkPermission } from '../utils/check-permission';

export const usePermissionsStore = defineStore({
  id: 'permissionsStore',
  state: () => ({
    permissions: {
      routes: [],
      fields: [],
    },
  }),
  actions: {
    async hydrate() {
      const { data } = await api.get('/user/permissions');

      this.permissions.routes = data.routes;
      this.permissions.fields = data.fields;
    },
    dehydrate() {
      this.$reset();
    },
    getPermission(
      collection: AvalilableCollections,
      action: string,
      referType: PermissionReferType
    ) {
      const permission = this.permissions.routes.find(
        (permissionName) =>
          permissionName ===
          `${referType.toUpperCase()}_${collection.toUpperCase()}_${action.toUpperCase()}`
      );

      return permission || null;
    },
    hasPermission(
      collection: AvalilableCollections,
      action: string,
      referType: PermissionReferType
    ) {
      return checkPermission(this.permissions.routes, collection, action, referType);
    },
  },
});
