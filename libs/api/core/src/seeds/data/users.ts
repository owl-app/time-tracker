import { Role, RolesEnum, User } from '@owl-app/lib-contracts';

export type UserData = Record<string, Partial<User & { password: string }>>;

export const dataUsers: Record<string, Partial<User & { password: string }>> = {
  adminSystem: {
    email: 'admin_system@example.com',
    firstName: 'Admin',
    lastName: 'System',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role],
    tenant: { id: '4a2576d3-9830-4790-8535-b708d42faa32', name: 'Admin System' },
  },
  adminCompany: {
    email: 'admin_company@example.com',
    firstName: 'Admin',
    lastName: 'Company',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role],
    tenant: { id: '3156ff3d-af4e-48fe-9e25-bbb64ef73fbb', name: 'Admin Company' },
  },
  user: {
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'User',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_USER } as Role],
    tenant: { id: '956ba497-f7ce-41eb-ab0f-ff309538748b', name: 'User' },
  },
};
