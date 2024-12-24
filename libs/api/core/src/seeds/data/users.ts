import { Role, RolesEnum, Tenant, User } from '@owl-app/lib-contracts';

export type UserData = Record<RolesEnum, Partial<User & { password: string }>>;

export const dataUsers: Record<RolesEnum, Partial<User & { password: string }>> = {
  [RolesEnum.ROLE_ADMIN_SYSTEM]: {
    email: 'admin_system@example.com',
    firstName: 'Admin',
    lastName: 'System',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role],
    tenant: { id: '4a2576d3-9830-4790-8535-b708d42faa32', name: 'Admin System' },
  },
  [RolesEnum.ROLE_ADMIN_COMPANY]: {
    email: 'admin_company@example.com',
    firstName: 'Admin',
    lastName: 'Company',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role],
    tenant: { id: '3156ff3d-af4e-48fe-9e25-bbb64ef73fbb', name: 'Company' },
  },
  [RolesEnum.ROLE_USER]: {
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'User',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_USER } as Role],
    tenant: { id: '3156ff3d-af4e-48fe-9e25-bbb64ef73fbb', name: 'Company' } as Tenant,
  },
};
