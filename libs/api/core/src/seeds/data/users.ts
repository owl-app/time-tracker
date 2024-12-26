import { Role, RolesEnum, User } from '@owl-app/lib-contracts';
import { dataTenants } from './tenant';

export type UserData = Record<RolesEnum, Partial<User & { password: string }>[]>;

export const dataUsers: UserData = {
  [RolesEnum.ROLE_ADMIN_SYSTEM]: [
    {
      id: 'c4c7bf75-0ac8-40da-9180-0c2277ee4785',
      email: 'admin_system_1@example.com',
      firstName: 'Admin',
      lastName: 'System 1',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role],
      tenant: dataTenants.tenantFirst,
    },
    {
      id: 'cc54121c-7d55-4a36-95ca-668fd2c082f2',
      email: 'admin_system_2@example.com',
      firstName: 'Admin',
      lastName: 'System 2',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role],
      tenant: dataTenants.tenantSecond,
    }
  ],
  [RolesEnum.ROLE_ADMIN_COMPANY]: [
    {
      id: '602937c9-d631-4530-ab69-cc617bd4f51d',
      email: 'admin_company_1@example.com',
      firstName: 'Admin',
      lastName: 'Company 1',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role],
      tenant: dataTenants.tenantFirst,
    },
    {
      id: '1bfeeb7f-d460-463e-be00-44793942d913',
      email: 'admin_company_2@example.com',
      firstName: 'Admin',
      lastName: 'Company 2',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role],
      tenant: dataTenants.tenantSecond,
    }
  ],
  [RolesEnum.ROLE_USER]: [
    {
      id: '83d07332-1dae-4fc4-9f13-603069ab93cd',
      email: 'user_1@example.com',
      firstName: 'User',
      lastName: 'User 1',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_USER } as Role],
      tenant: dataTenants.tenantFirst,
    },
    {
      id: 'cf16e229-b882-4589-9fc0-dde8f1ed4482',
      email: 'user_2@example.com',
      firstName: 'User',
      lastName: 'User 1',
      password: 'test',
      roles: [{ name: RolesEnum.ROLE_USER } as Role],
      tenant: dataTenants.tenantSecond,
    }
  ],
};
