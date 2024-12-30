import { RolesEnum } from '@owl-app/lib-contracts';

export const hasPermissionAnotherTenant = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM;

export const hasPermissionToArchived = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM || role === RolesEnum.ROLE_ADMIN_COMPANY;

export const hasPermissionToUsersByRole = (role: RolesEnum, roleToCheck: RolesEnum): boolean => {
  const permissions: { [key in RolesEnum]: RolesEnum[] } = {
    [RolesEnum.ROLE_ADMIN_SYSTEM]: [RolesEnum.ROLE_ADMIN_SYSTEM, RolesEnum.ROLE_ADMIN_COMPANY, RolesEnum.ROLE_USER],
    [RolesEnum.ROLE_ADMIN_COMPANY]: [ RolesEnum.ROLE_ADMIN_COMPANY, RolesEnum.ROLE_USER],
    [RolesEnum.ROLE_USER]: [],
  }

  return permissions[role].includes(roleToCheck);
}
