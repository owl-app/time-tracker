import {
  AvalilableCollections,
  ClientActions,
  CommonActions,
  Permission,
  ProjectActions,
  RoleActions,
  TagActions,
  TimeActions,
  UserActions,
} from '@owl-app/lib-contracts';

import { getCrudPermissions, getPermissionsByCollection } from '../../utils/permission';

export const allExistPermissions: Permission[] = [
  ...getCrudPermissions(),
  ...getPermissionsByCollection<typeof UserActions>(AvalilableCollections.USER, UserActions),
  ...getPermissionsByCollection<typeof TagActions>(AvalilableCollections.TAG, TagActions),
  ...getPermissionsByCollection<typeof ProjectActions>(
    AvalilableCollections.PROJECT,
    ProjectActions
  ),
  ...getPermissionsByCollection<typeof RoleActions>(AvalilableCollections.ROLE, RoleActions),
  ...getPermissionsByCollection<typeof TimeActions>(AvalilableCollections.TIME, TimeActions),
  ...getPermissionsByCollection<typeof ClientActions>(AvalilableCollections.CLIENT, ClientActions),
  // archive
  ...getPermissionsByCollection<typeof CommonActions>(AvalilableCollections.CLIENT, CommonActions),
  ...getPermissionsByCollection<typeof CommonActions>(AvalilableCollections.PROJECT, CommonActions),
  ...getPermissionsByCollection<typeof CommonActions>(AvalilableCollections.TAG, CommonActions),
];
