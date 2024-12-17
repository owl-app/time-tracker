import { Controller, HttpStatus, Get, Put, Body, HttpCode, Injectable } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  AvalilableCollections,
  profileUserValidationSchema,
  UserActions,
} from '@owl-app/lib-contracts';
import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';

import type { AppQueryService } from '@owl-app/lib-api-core/query/core/interfaces/app-query.service';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { RequestContextService } from '@owl-app/lib-api-core/context/app-request-context';

import { UserEntity } from '../../../../domain/entity/user.entity';
import { UpdateProfileRequest } from './dto/update-profile.request';
import { ProfileAssembler } from './profile.assembler';
import { ProfileDto } from './dto/profile.dto';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@Injectable()
export class ProfileController {
  constructor(
    @InjectAssemblerQueryService(ProfileAssembler)
    readonly service: AppQueryService<UserEntity>
  ) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found profile',
    type: ProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Profile not found',
    type: ApiErrorResponse,
  })
  @Get('/profile')
  @RoutePermissions(AvalilableCollections.USER, UserActions.PROFILE)
  async findOne() {
    const user = await this.service.getById(RequestContextService.getCurrentUserId());

    return user;
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiAcceptedResponse({
    description: 'Profile has been successfully updated.',
    type: ProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('/profile')
  @RoutePermissions(AvalilableCollections.USER, UserActions.PROFILE)
  async update(
    @Body(new ValibotValidationPipe(profileUserValidationSchema))
    updateProfileRequest: UpdateProfileRequest
  ): Promise<ProfileDto> {
    const updatedProfile = await this.service.updateWithRelations(
      RequestContextService.getCurrentUserId(),
      updateProfileRequest
    );

    return updatedProfile;
  }
}
