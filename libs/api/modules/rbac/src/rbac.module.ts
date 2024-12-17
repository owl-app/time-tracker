import { Module } from '@nestjs/common';

import { RbacPermissionModule } from './permission/permission.module';
import { RbacRoleModule } from './role/role.module';

@Module({
  imports: [
    RbacPermissionModule,
    RbacRoleModule,
  ],
})
export class RbacModule {}
