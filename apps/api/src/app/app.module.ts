import { Module } from '@nestjs/common';

import { UserAccessModule } from '@owl-app/lib-api-module-user-access/user-access.module';
import { ClientModule } from '@owl-app/lib-api-module-client/client.module';
import { RequestContextModule } from '@owl-app/request-context-nestjs';
import { RbacModule } from '@owl-app/lib-api-module-rbac/rbac.module';
import { TimeTrackerModule } from '@owl-app/lib-api-module-time-tracker/time-tracker.module';
import { TagModule } from '@owl-app/lib-api-module-tag/tag.module';
import { ProjectModule } from '@owl-app/lib-api-module-project/project.module';

@Module({
  imports: [
    UserAccessModule,
    ClientModule,
    RbacModule,
    TimeTrackerModule,
    RequestContextModule,
    TagModule,
    ProjectModule,
  ],
  exports: [
    // RbacModule
  ],
})
export class AppModule {}
