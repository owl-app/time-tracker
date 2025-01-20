import { AuthUserData, RolesEnum } from "@owl-app/lib-contracts";
import { TEST_TENANT_CREATED } from "../seeds/data/tenant.data";

export const authUserData: AuthUserData = {
    id: 'test-id',
    username: 'test-username',
    email: 'test-email@test.com',
    tenant: TEST_TENANT_CREATED[0],
    roles: [RolesEnum.ROLE_ADMIN_COMPANY],
    permissions: {
      'routes': ['test-route'],
      'fields': ['test-field'],
    },
}