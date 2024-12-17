import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PUBLIC_ROUTE_KEY } from '../metadata/route';

export const isPublicRoute = (reflector: Reflector, context: ExecutionContext): boolean => {
  const isPublic = reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) {
    return true;
  }

  return false;
};
