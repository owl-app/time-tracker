import {
  Controller,
  HttpStatus,
  Put,
  Body,
  Param,
  HttpCode,
  Injectable,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RbacManager, Role } from '@owl-app/rbac-manager';

import { AvalilableCollections, UserActions } from '@owl-app/lib-contracts';
import { Permission } from '@owl-app/lib-api-core/rbac/types/permission';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { InjectQueryServiceRepository } from '@owl-app/lib-api-core/query/common/repository.decorator';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';

import type { IUserRepository } from '../../../../database/repository/user-repository.interface';
import { UserEntity } from '../../../../domain/entity/user.entity';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
@Injectable()
export class AssignAccessController {
  constructor(
    @InjectQueryServiceRepository(UserEntity)
    private readonly userRepository: IUserRepository,
    @Inject('RBAC_MANAGER') readonly rbacManager: RbacManager<Permission, Role>
  ) {}

  @ApiOperation({ summary: 'Assign permission or roles to user' })
  @ApiAcceptedResponse({
    description: 'Role or permission has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/assign-access/:id')
  @RoutePermissions(AvalilableCollections.USER, UserActions.ASSIGN_ACCESS)
  async assignAccess(
    @Param('id', UUIDValidationPipe) userId: string,
    @Body() items: Array<string>
  ): Promise<void> {
    const { id } = await this.userRepository.findOneByIdString(userId);

    await Promise.all(
      items.map(async (item: string): Promise<void> => {
        await this.rbacManager.assign(item, id);
      })
    );
  }
}
