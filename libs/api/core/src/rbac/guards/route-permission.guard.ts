import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthUserData } from '@owl-app/lib-contracts';

import { ROUTE_PERMISSIONS_KEY } from '../decorators/route-permission';
import { isPublicRoute } from '../../utils/route';

@Injectable()
export class RoutePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!isPublicRoute(this.reflector, context)) {
      const permissions = this.reflector.getAllAndOverride<string[]>(ROUTE_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      const { user }: { user: AuthUserData } = context.switchToHttp().getRequest();

      return permissions.some((permission) => user.permissions?.routes.includes(permission));
    }

    return true;
  }
}
