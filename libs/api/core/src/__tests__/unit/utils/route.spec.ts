import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isPublicRoute } from '../../../utils/route';
import { PUBLIC_ROUTE_KEY } from '../../../metadata/route';

describe('#utils', () => {
  describe('isPublicRoute', () => {
    let reflector: Reflector;
    let context: ExecutionContext;

    beforeEach(() => {
      reflector = new Reflector();
      context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    });

    it('should return true if the route is public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = isPublicRoute(reflector, context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PUBLIC_ROUTE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return false if the route is not public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = isPublicRoute(reflector, context);

      expect(result).toBe(false);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PUBLIC_ROUTE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
