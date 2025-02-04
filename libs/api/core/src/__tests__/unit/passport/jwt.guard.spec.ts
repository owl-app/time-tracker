import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';

import { JwtAuthGuard } from '../../../passport/jwt.guard';
import * as routeUtils from '../../../utils/route';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    mockExecutionContext = {} as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call super.canActivate when route is not public', () => {
    jest.spyOn(routeUtils, 'isPublicRoute').mockReturnValue(false);
    const superActivateSpy = jest
      .spyOn(PassportAuthGaurd('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockExecutionContext);

    expect(routeUtils.isPublicRoute).toHaveBeenCalledWith(reflector, mockExecutionContext);
    expect(superActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should return true and not call super.canActivate when route is public', () => {
    jest.spyOn(routeUtils, 'isPublicRoute').mockReturnValue(true);
    const superActivateSpy = jest
      .spyOn(PassportAuthGaurd('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockExecutionContext);

    expect(routeUtils.isPublicRoute).toHaveBeenCalledWith(reflector, mockExecutionContext);
    expect(superActivateSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
