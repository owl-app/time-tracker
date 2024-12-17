import {
  Controller,
  HttpStatus,
  Body,
  Inject,
  Injectable,
  Put,
  HttpCode,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AvalilableCollections, RoleActions } from '@owl-app/lib-contracts';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { RbacManager, Role } from '@owl-app/rbac-manager';
import { Permission } from '@owl-app/lib-api-core/rbac/types/permission';

@ApiTags('Rbac Role')
@Controller('rbac/roles')
@ApiBearerAuth()
@Injectable()
export class RevokeController {
  constructor(@Inject('RBAC_MANAGER') readonly rbacManager: RbacManager<Permission, Role>) {}

  @ApiOperation({ summary: 'Revoke role or permissions from role' })
  @ApiAcceptedResponse({
    description: 'Revoke has been successfully invoked.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/revoke/:name')
  @RoutePermissions(AvalilableCollections.ROLE, RoleActions.REVOKE)
  async revoke(@Param('name') name: string, @Body() items: Array<string>) {
    items.map(async (item: string): Promise<void> => {
      this.rbacManager.removeChild(name, item);
    });
  }
}
