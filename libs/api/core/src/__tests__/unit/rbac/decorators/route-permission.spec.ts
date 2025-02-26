import { SetMetadata } from '@nestjs/common';

import { PermissionReferType } from '@owl-app/lib-contracts';

import {
  RoutePermissions,
  ROUTE_PERMISSIONS_KEY,
} from '../../../../rbac/decorators/route-permission';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('RoutePermissions', () => {
  const mockSetMetadata = SetMetadata as jest.Mock;

  beforeEach(() => {
    mockSetMetadata.mockClear();
  });

  it('should set metadata with single action string', () => {
    const collection = 'test';
    const action = 'read';
    RoutePermissions(collection, action);

    expect(mockSetMetadata).toHaveBeenCalledWith(ROUTE_PERMISSIONS_KEY, [
      `${PermissionReferType.ROUTE.toUpperCase()}_${collection.toUpperCase()}_${action.toUpperCase()}`,
    ]);
  });

  it('should set metadata with multiple actions', () => {
    const collection = 'items';
    const actions = ['create', 'delete'];
    RoutePermissions(collection, actions);

    expect(mockSetMetadata).toHaveBeenCalledWith(
      ROUTE_PERMISSIONS_KEY,
      actions.map(
        (actionName) =>
          `${PermissionReferType.ROUTE.toUpperCase()}_${collection.toUpperCase()}_${actionName.toUpperCase()}`
      )
    );
  });
});
