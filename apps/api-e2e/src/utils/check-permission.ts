import { RolesEnum } from '@owl-app/lib-contracts';

export const hasPermissionAnotherTenant = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM;

export const hasPermissionToArchived = (role: RolesEnum): boolean =>
  [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY].includes(role);

export const getPermissionsToUsersByRole = (role: RolesEnum): RolesEnum[] => {
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
  getPermissionsToUsersByRole(role).includes(roleToCheck);
