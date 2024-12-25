import { RolesEnum } from "@owl-app/lib-contracts";

export const shouldCheckTenantPermission = (role: RolesEnum): boolean => role === RolesEnum.ROLE_ADMIN_SYSTEM;
