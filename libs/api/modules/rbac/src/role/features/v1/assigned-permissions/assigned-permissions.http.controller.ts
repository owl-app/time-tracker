import { Controller, HttpStatus, Inject, Injectable, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AvalilableCollections, RoleActions } from '@owl-app/lib-contracts';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { RbacManager, Role } from '@owl-app/rbac-manager';
import { Permission } from '@owl-app/lib-api-core/rbac/types/permission';

@ApiTags('Rbac Role')
@Controller('rbac/roles')
@ApiBearerAuth()
@Injectable()
export class AssignedPermissionsController {
  constructor(@Inject('RBAC_MANAGER') readonly rbacManager: RbacManager<Permission, Role>) {}

  @ApiOperation({ summary: 'Find all assigned permissions to role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: String,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get('assigned-permissions/:name')
  @RoutePermissions(AvalilableCollections.ROLE, RoleActions.ASSIGNED_PERMISSIONS)
  async assignedPermissions(@Param('name') name: string): Promise<string[]> {
    const permissions = await this.rbacManager.getPermissionsByRoleName(name);

    return Object.keys(permissions);
  }
}
