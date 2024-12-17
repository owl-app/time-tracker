import { Request, Response } from 'express';
import { Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthUserData, AvalilableCollections, UserActions } from '@owl-app/lib-contracts';

import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';

import { InvalidAuthenticationError } from '../../../domain/auth.errors';

import { Logout } from './logout.service';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ status: 500, description: 'Internal error' })
@ApiBearerAuth()
export class LogoutController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ description: 'logout' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully logout.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: InvalidAuthenticationError.message,
    type: ApiErrorResponse,
  })
  @Post('/logout')
  @RoutePermissions(AvalilableCollections.USER, UserActions.LOGOUT)
  async logout(
    @Req() request: Request & { user: Partial<AuthUserData> },
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    await this.commandBus.execute<Logout, void>(new Logout({ email: request.user.email }));

    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
