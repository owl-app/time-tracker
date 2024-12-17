import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IJwtTokenService, Token } from '@owl-app/lib-api-core/passport/jwt-token.interface';

import { UserEntity } from '../../../domain/entity/user.entity';
import { InvalidAuthenticationError } from '../../../domain/auth.errors';

export class RefreshToken {
  token: string;

  email: string;

  constructor(request: Partial<RefreshToken> = {}) {
    Object.assign(this, request);
  }
}

@CommandHandler(RefreshToken)
export class RefreshTokenHandler implements ICommandHandler<RefreshToken> {
  constructor(
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService<UserEntity>
  ) {}

  async execute(data: RefreshToken): Promise<Record<'accessToken' | 'refreshToken', Token>> {
    if (!(await this.jwtTokenService.getUserIfRefreshTokenMatches(data.token, data.email))) {
      throw new InvalidAuthenticationError();
    }

    const accessToken = await this.jwtTokenService.getJwtToken(data.email);
    const refreshToken = await this.jwtTokenService.getJwtRefreshToken(data.email);

    return {
      accessToken,
      refreshToken,
    };
  }
}
