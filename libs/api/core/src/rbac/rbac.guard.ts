import { Observable } from 'rxjs';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isPublicRoute } from '../utils/route';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (!isPublicRoute(this.reflector, context)) {
      return true;
    }

    return true;
  }
}
