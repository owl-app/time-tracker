import { Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UnprocessableEntityException,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { loginValidationSchema } from '@owl-app/lib-contracts';

import { Public } from '@owl-app/lib-api-core/metadata/route';
import { ApiErrorValidationResponse } from '@owl-app/lib-api-core/api/api-error-validation.response';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import { Token } from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { type IJwtConfig, JWT_CONFIG_PROVIDER } from '@owl-app/lib-api-core/config';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';

import { InvalidAuthenticationError } from '../../../domain/auth.errors';

import { AuthResponse } from './dto/auth.response';
import { AuthRequest } from './dto/auth.request';
import { Login } from './login.service';

@Controller('auth')
@ApiTags('Auth')
@ApiResponse({ status: 500, description: 'Internal error' })
export class LoginController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(JWT_CONFIG_PROVIDER)
    private jwtConfig: IJwtConfig
  ) {}

  @ApiOperation({ description: 'login' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AuthRequest })
  @Public()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully logged.',
    type: AuthResponse,
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
  @Post('/login')
  @UsePipes(new ValibotValidationPipe(loginValidationSchema))
  async login(
    @Body() auth: AuthRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponse> {
    try {
      const result = await this.commandBus.execute<
        Login,
        Record<'accessToken' | 'refreshToken', Token>
      >(new Login(auth));

      response.cookie('access_token', result.accessToken.token, {
        httpOnly: this.jwtConfig.cookie.http_only,
        secure: this.jwtConfig.cookie.secure,
        maxAge: result.accessToken.expiresIn,
        domain: this.jwtConfig.cookie.domain,
      });

      response.cookie('refresh_token', result.refreshToken.token, {
        httpOnly: this.jwtConfig.cookie.http_only,
        secure: this.jwtConfig.cookie.secure,
        maxAge: result.refreshToken.expiresIn,
        domain: this.jwtConfig.cookie.domain,
      });

      return {
        accessTokenExpires: result.accessToken.expiresIn,
        refreshTokenExpires: result.refreshToken.expiresIn,
      };
    } catch (error: unknown) {
      if (error instanceof InvalidAuthenticationError) {
        throw new UnprocessableEntityException(error.message);
      }

      throw error;
    }
  }
}
