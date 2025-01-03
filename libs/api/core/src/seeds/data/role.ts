import {
  AvalilableCollections,
  ClientActions,
  CommonActions,
  Permission,
  ProjectActions,
  RoleActions,
  RolesEnum,
  TagActions,
  TimeActions,
  UserActions,
} from '@owl-app/lib-contracts';

import {
  getCrudPermissions,
  getPermissionsByCollection,
  getRoutePermission,
  getRouteName,
} from '../../utils/permission';
import { allExistPermissions } from './permission';

export const dataRoles: Record<RolesEnum, Permission[]> = {
  [RolesEnum.ROLE_ADMIN_SYSTEM]: allExistPermissions,
  [RolesEnum.ROLE_ADMIN_COMPANY]: [
    // client
    ...getCrudPermissions(AvalilableCollections.CLIENT),
    ...getPermissionsByCollection<typeof CommonActions>(
      AvalilableCollections.CLIENT,
      CommonActions
    ),

    // project
    ...getCrudPermissions(AvalilableCollections.PROJECT),
    ...getPermissionsByCollection<typeof ProjectActions>(
      AvalilableCollections.PROJECT,
      ProjectActions
    ),
    ...getPermissionsByCollection<typeof CommonActions>(
      AvalilableCollections.PROJECT,
      CommonActions
    ),

    // tag
    ...getCrudPermissions(AvalilableCollections.TAG),
    ...getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TAG, TagActions),
    ...getPermissionsByCollection<typeof CommonActions>(AvalilableCollections.TAG, CommonActions),

    // time
    ...getCrudPermissions(AvalilableCollections.TIME),
    ...getPermissionsByCollection<typeof TimeActions>(AvalilableCollections.TIME, TimeActions),

    // user
    ...getCrudPermissions(AvalilableCollections.USER),
    ...getPermissionsByCollection<typeof UserActions>(
      AvalilableCollections.USER,
      UserActions
    ).filter(
      (permission) =>
        permission.name !== getRouteName(AvalilableCollections.USER, UserActions.ASSIGN_ACCESS)
    ),

    // role
    getRoutePermission(AvalilableCollections.ROLE, RoleActions.AVAILABLE),
  ],
  [RolesEnum.ROLE_USER]: [
    // time
    ...getCrudPermissions(AvalilableCollections.TIME),
    ...getPermissionsByCollection<typeof TimeActions>(AvalilableCollections.TIME, TimeActions),

    // user
    getRoutePermission(AvalilableCollections.USER, UserActions.ME),
    getRoutePermission(AvalilableCollections.USER, UserActions.PERMISSIONS),
    getRoutePermission(AvalilableCollections.USER, UserActions.PROFILE),

    // clients
    getRoutePermission(AvalilableCollections.CLIENT, ClientActions.AVAILABLE),

    // projects
    getRoutePermission(AvalilableCollections.PROJECT, ClientActions.AVAILABLE),
  ],
};
