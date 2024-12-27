import { RolesEnum } from '@owl-app/lib-contracts';

export const hasPermissionAnotherTenant = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM;

export const hasPermissionToArchived = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM || role === RolesEnum.ROLE_ADMIN_COMPANY;
