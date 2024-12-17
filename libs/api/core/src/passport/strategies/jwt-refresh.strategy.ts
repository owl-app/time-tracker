import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';

import { AuthUserData, User } from '@owl-app/lib-contracts';

import { JWT_CONFIG_PROVIDER, type IJwtConfig } from '../../config/jwt';
import { IJwtTokenPayload, IJwtTokenService } from '../jwt-token.interface';
import { extractJWT } from '../extract-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(JWT_CONFIG_PROVIDER)
    private jwtConfig: IJwtConfig,
    @Inject(IJwtTokenService)
    private jwtTokenService: IJwtTokenService<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJWT('refresh_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshTokenSecret,
    });
  }

  async validate(payload: IJwtTokenPayload): Promise<Partial<AuthUserData>> {
    return {
      email: payload.email,
    };
  }
}
