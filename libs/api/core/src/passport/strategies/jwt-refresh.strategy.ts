import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';

import { AuthUserData } from '@owl-app/lib-contracts';

import { JWT_CONFIG_PROVIDER, type JwtConfig } from '../../config/jwt';
import { IJwtTokenPayload } from '../jwt-token.interface';
import { extractJWT } from '../extract-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(JWT_CONFIG_PROVIDER)
    jwtConfig: JwtConfig,
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
