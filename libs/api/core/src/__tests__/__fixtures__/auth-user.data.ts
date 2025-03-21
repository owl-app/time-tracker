import { AuthUserData, Role, RolesEnum } from '@owl-app/lib-contracts';

import { TEST_TENANT_CREATED } from '../seeds/data/tenant.data';
import { dataRoles } from '../../seeds/data/role';

import { TenantEntity } from './tenant.entity';

export const authUserData: AuthUserData = {
  id: 'test-id',
  username: 'test-username',
  email: 'test-email@test.com',
  tenant: TEST_TENANT_CREATED[0],
  roles: [RolesEnum.ROLE_ADMIN_COMPANY],
  permissions: {
    routes: dataRoles[RolesEnum.ROLE_ADMIN_COMPANY].map((permission) => permission.name),
    fields: ['test-field'],
  },
};

export const createAuthUserData = (tenant: TenantEntity, roles?: Role['name'][]): AuthUserData => {
  const userData = {
    ...authUserData,
    tenant,
  };

  if (roles) {
    userData.roles = roles;
  }

  return userData;
};
