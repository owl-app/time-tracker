import { defineModule } from '@owl-app/lib-app-core/application/defines/module';
import RouterPass from '@owl-app/lib-app-core/router/passthrough';

import ListRoleRoute from './routes/role-list.vue';
import ListPermissionRoute from './routes/permission-list.vue';
import AssignPermissionsRoute from './routes/permission-assign.vue';

export default defineModule({
  id: 'rbac',
  name: '$t:rbac_module',
  icon: 'people_alt',
  routes: {
    private: [
      {
        path: 'rbac/roles',
        component: RouterPass,
        children: [
          {
            name: 'role-list',
            path: '',
            component: ListRoleRoute,
            meta: {
              private: true,
            },
          },
          {
            name: 'role-permission-assign',
            path: 'assing-permissions/:roleId',
            component: AssignPermissionsRoute,
            meta: {
              private: true,
            },
          },
        ],
      },
      {
        name: 'permission-list',
        path: 'rbac/permissions',
        component: ListPermissionRoute,
        meta: {
          private: true,
        },
      },
    ],
  },
});
