import { AvalilableCollections, CrudActions } from '@owl-app/lib-contracts';

import { usePermissions } from '../../../../composables/use-permissions';

export interface INavigationRoute {
  name: string;
  displayName: string;
  hasPermission: boolean;
  meta: {
    icon: string;
    untrackedPages?: string[];
  };
  children?: INavigationRoute[];
}

const { hasRoutePermission } = usePermissions();

export default function getRoutes() {
  return {
    root: {
      name: '/',
      displayName: 'navigationRoutes.home',
    },
    routes: [
      {
        name: 'time-list',
        displayName: 'time_tracker',
        meta: {
          icon: 'schedule',
        },
        hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.TIME),
      },
      {
        name: 'manage',
        displayName: 'manage',
        children: [
          {
            name: 'client-list',
            displayName: 'clients',
            meta: {
              icon: 'person',
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.CLIENT),
          },
          {
            name: 'tag-list',
            displayName: 'tags',
            meta: {
              icon: 'sell',
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.TAG),
          },
          {
            name: 'project-list',
            displayName: 'projects',
            meta: {
              icon: 'source_notes',
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.PROJECT),
          },
        ],
      },
      {
        name: 'permissions',
        displayName: 'access_control',
        children: [
          {
            name: 'role-list',
            displayName: 'roles',
            meta: {
              icon: 'guardian',
              untrackedPages: ['role-permission-assign'],
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.ROLE),
          },
          {
            name: 'permission-list',
            displayName: 'permissions',
            meta: {
              icon: 'vpn_key',
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.PERMISSION),
          },
        ],
      },
      {
        name: 'system',
        displayName: 'system',
        children: [
          {
            name: 'user-list',
            displayName: 'users',
            meta: {
              icon: 'group',
            },
            hasPermission: hasRoutePermission(CrudActions.LIST, AvalilableCollections.USER),
          },
        ],
      },
    ] as INavigationRoute[],
  };
}
