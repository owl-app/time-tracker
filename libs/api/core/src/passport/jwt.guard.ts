import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';

import { isPublicRoute } from '../utils/route';

@Injectable()
export class JwtAuthGuard extends PassportAuthGaurd('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    if (!isPublicRoute(this.reflector, context)) {
      return super.canActivate(context);
    }

    return true;
  }
}
