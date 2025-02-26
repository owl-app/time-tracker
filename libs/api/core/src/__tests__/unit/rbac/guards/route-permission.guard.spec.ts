import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

import { authUserData } from '../../../__fixtures__/auth-user.data';
import { RoutePermissionGuard } from '../../../../rbac/guards/route-permission.guard';
import { ROUTE_PERMISSIONS_KEY } from '../../../../rbac/decorators/route-permission';
import { isPublicRoute } from '../../../../utils/route';

jest.mock('../../../../utils/route', () => ({
  isPublicRoute: jest.fn(),
}));

describe('RoutePermissionGuard', () => {
  let guard: RoutePermissionGuard;
  let reflector: Reflector;

  const mockContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoutePermissionGuard(reflector);
    jest.clearAllMocks();
  });

  it('should return true if route is public', () => {
    (isPublicRoute as jest.Mock).mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should return true when user has required route permissions', () => {
    (isPublicRoute as jest.Mock).mockReturnValue(false);
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([authUserData.permissions.routes[0]]);

    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({ user: authUserData });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROUTE_PERMISSIONS_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should return false when user does not have required route permissions', () => {
    (isPublicRoute as jest.Mock).mockReturnValue(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ROUTE_FOO_READ']);

    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({ user: authUserData });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should return false if no user is found', () => {
    (isPublicRoute as jest.Mock).mockReturnValue(false);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ROUTE_FOO_READ']);

    (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({});

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });
});
