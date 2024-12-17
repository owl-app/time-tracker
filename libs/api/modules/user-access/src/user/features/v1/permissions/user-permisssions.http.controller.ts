import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AvalilableCollections, UserActions } from '@owl-app/lib-contracts';
import { RequestContextService } from '@owl-app/lib-api-core/context/app-request-context';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { UserPermissionResponse } from './dto/user-permission.response';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserPermissionsController {
  @ApiOperation({ description: 'permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all user permissions',
  })
  @Get('/permissions')
  @RoutePermissions(AvalilableCollections.USER, UserActions.PERMISSIONS)
  async getUserPermissions(): Promise<UserPermissionResponse> {
    const { routes, fields } = RequestContextService.getCurrentUser().permissions;

    return new UserPermissionResponse(routes, fields);
  }
}
