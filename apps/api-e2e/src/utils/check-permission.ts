import { RolesEnum } from '@owl-app/lib-contracts';

export const hasPermissionAnotherTenant = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM;

export const hasPermissionAnotherUser = (role: RolesEnum): boolean =>
  [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY].includes(role);

export const hasPermissionToArchived = (role: RolesEnum): boolean =>
  [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY].includes(role);

export const getPermissionsToRoles = (role: RolesEnum): RolesEnum[] => {
  const permissions: Record<RolesEnum, RolesEnum[]> = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: [
      RolesEnum.ROLE_ADMIN_SYSTEM,
      RolesEnum.ROLE_ADMIN_COMPANY,
      RolesEnum.ROLE_USER,
    ],
    [RolesEnum.ROLE_ADMIN_COMPANY]: [RolesEnum.ROLE_ADMIN_COMPANY, RolesEnum.ROLE_USER],
    [RolesEnum.ROLE_USER]: [RolesEnum.ROLE_USER],
  };

  return permissions[role];
};

export const hasPermissionToUsersByRole = (role: RolesEnum, roleToCheck: RolesEnum): boolean =>
  getPermissionsToRoles(role).includes(roleToCheck);

export const hasPermissionToAllRoles = (role: RolesEnum): boolean => {
  if (role === RolesEnum.ROLE_ADMIN_SYSTEM) {
    return true;
  }

  return false;
}
