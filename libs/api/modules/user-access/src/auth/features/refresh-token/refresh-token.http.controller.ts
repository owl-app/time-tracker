import { Request, Response } from 'express';
import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthUserData } from '@owl-app/lib-contracts';

import { Public } from '@owl-app/lib-api-core/metadata/route';
import { ApiErrorValidationResponse } from '@owl-app/lib-api-core/api/api-error-validation.response';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import { Token } from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { JwtRefreshGuard } from '@owl-app/lib-api-core/passport/guards/jwt-refresh.guard';

import { InvalidAuthenticationError } from '../../../domain/auth.errors';

import { TokenResponse } from '../../dto/token.response';
import { RefreshToken } from './refresh-token.service';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ status: 500, description: 'Internal error' })
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ description: 'login' })
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully logged.',
    type: TokenResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: InvalidAuthenticationError.message,
    type: ApiErrorResponse,
  })
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  async refresh(
    @Req() request: Request & { user: Partial<AuthUserData> },
    @Res({ passthrough: true }) response: Response
  ): Promise<TokenResponse> {
    try {
      const result = await this.commandBus.execute<
        RefreshToken,
        Record<'accessToken' | 'refreshToken', Token>
      >(new RefreshToken({ token: request.cookies?.refresh_token, email: request.user.email }));

      response.cookie('access_token', result.accessToken.token, {
        httpOnly: true,
        secure: true,
        maxAge: result.accessToken.expiresIn,
      });

      response.cookie('refresh_token', result.refreshToken.token, {
        httpOnly: true,
        secure: true,
        maxAge: result.refreshToken.expiresIn,
      });

      return {
        accessTokenExpires: result.accessToken.expiresIn,
        refreshTokenExpires: result.refreshToken.expiresIn,
      };
    } catch (error: unknown) {
      if (error instanceof InvalidAuthenticationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
