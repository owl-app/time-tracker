import { RolesEnum } from '@owl-app/lib-contracts';

export const hasPermissionAnotherTenant = (role: RolesEnum): boolean =>
  role === RolesEnum.ROLE_ADMIN_SYSTEM;
