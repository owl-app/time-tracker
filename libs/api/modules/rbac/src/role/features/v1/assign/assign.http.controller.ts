import {
  Controller,
  HttpStatus,
  Body,
  Inject,
  Injectable,
  Put,
  HttpCode,
  Param,
  UnprocessableEntityException,
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
export class AssignController {
  constructor(@Inject('RBAC_MANAGER') readonly rbacManager: RbacManager<Permission, Role>) {}

  @ApiOperation({ summary: 'Assign to role permissions or other roles' })
  @ApiAcceptedResponse({
    description: 'Assign has been successfully invoked.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/assign/:name')
  @RoutePermissions(AvalilableCollections.ROLE, RoleActions.ASSIGN)
  async assign(@Param('name') name: string, @Body() items: Array<string>): Promise<void> {
    const errors: string[] = [];

    await Promise.all(
      items.map(async (item: string): Promise<void> => {
        try {
          await this.rbacManager.addChild(name, item);
        } catch (error: unknown) {
          errors.push((error as Error)?.message);
        }
      })
    );

    if (errors.length > 0) {
      throw new UnprocessableEntityException(errors.join(', '));
    }
  }
}
