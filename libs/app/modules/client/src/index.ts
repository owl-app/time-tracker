import { AvalilableCollections, CrudActions, PermissionReferType } from '@owl-app/lib-contracts';

import { defineModule } from '@owl-app/lib-app-core/application/defines/module';
import { checkPermission } from '@owl-app/lib-app-core/utils/check-permission';

import ListRoute from './routes/list.vue';

export default defineModule({
  id: 'client',
  name: '$t:client_module',
  icon: 'people_alt',
  routes: {
    private: [
      {
        name: 'client-list',
        path: 'clients',
        component: ListRoute,
        props: (route) => ({
          ssoErrorCode: route.query.error ? route.query.code : null,
          logoutReason: route.query.reason,
        }),
        meta: {
          private: true,
        },
      },
    ],
  },
  preRegisterCheck(user, permissions) {
    return checkPermission(
      permissions,
      AvalilableCollections.CLIENT,
      CrudActions.LIST,
      PermissionReferType.ROUTE
    );
  },
});
