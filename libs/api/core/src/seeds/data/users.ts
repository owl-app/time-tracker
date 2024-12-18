import { Role, RolesEnum, User } from '@owl-app/lib-contracts';

export type UserData = Record<string, Partial<User & { password: string }>>;

export const dataUsers: Record<string, Partial<User & { password: string }>> = {
  adminSystem: {
    email: 'admin_system@test.example',
    firstName: 'Admin',
    lastName: 'System',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_SYSTEM } as Role]
  },
  adminCompany: {
    email: 'admin_company@test.example',
    firstName: 'Admin',
    lastName: 'Company',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY } as Role]
  },
  user: {
    email: 'user@test.example',
    firstName: 'User',
    lastName: 'User',
    password: 'test',
    roles: [{ name: RolesEnum.ROLE_USER } as Role]
  }
}
