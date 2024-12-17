import { AvalilableCollections, CrudActions, PermissionReferType } from '@owl-app/lib-contracts';

import { defineModule } from '@owl-app/lib-app-core/application/defines/module';
import { checkPermission } from '@owl-app/lib-app-core/utils/check-permission';

import ListRoute from './routes/list.vue';

export default defineModule({
  id: 'project',
  name: '$t:project_module',
  icon: 'source_notes',
  routes: {
    private: [
      {
        name: 'project-list',
        path: 'projects',
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
      AvalilableCollections.PROJECT,
      CrudActions.LIST,
      PermissionReferType.ROUTE
    );
  },
});
