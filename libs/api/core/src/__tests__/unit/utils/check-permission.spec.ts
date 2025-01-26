import {
  AvalilableCollections,
  CrudActions,
  RolesEnum,
} from '@owl-app/lib-contracts';

import { RequestContextService } from '../../../context/app-request-context';
import { checkPermissionToRoute, roleHasPermission } from '../../../utils/check-permission';
import { authUserData } from '../../__fixtures__/auth-user.data';

jest.mock('../../../context/app-request-context');

describe('checkPermissionToRoute', () => {
  it('should return true if the user has permission to the route', () => {
    RequestContextService.getCurrentUser = jest.fn().mockReturnValue(authUserData);

    const result = checkPermissionToRoute(AvalilableCollections.PROJECT, CrudActions.CREATE);

    expect(result).toBe(true);
  });

  it('should return false if the user does not have permission to the route', () => {
    RequestContextService.getCurrentUser = jest.fn().mockReturnValue(authUserData);

    const result = checkPermissionToRoute(AvalilableCollections.ROLE, 'test_action');

    expect(result).toBe(false);
  });
});

describe('roleHasPermission', () => {
  it('should return true if the role has permission', () => {
    const result = roleHasPermission(
      RolesEnum.ROLE_ADMIN_COMPANY,
      AvalilableCollections.PROJECT,
      CrudActions.CREATE
    );

    expect(result).toBe(true);
  });

  it('should return false if the role does not have permission', () => {
    const result = roleHasPermission(
      RolesEnum.ROLE_ADMIN_COMPANY,
      AvalilableCollections.ROLE,
      'test_action'
    );

    expect(result).toBe(false);
  });

  it('should return true if the role has permission for any action in the array', () => {
    const result = roleHasPermission(RolesEnum.ROLE_ADMIN_COMPANY, AvalilableCollections.PROJECT, [
      CrudActions.CREATE,
      CrudActions.UPDATE,
    ]);

    expect(result).toBe(true);
  });

  it('should return false if the role does not have permission for any action in the array', () => {
    const result = roleHasPermission(RolesEnum.ROLE_ADMIN_COMPANY, AvalilableCollections.ROLE, [
      'test_action_1',
      'test_action_2',
    ]);

    expect(result).toBe(false);
  });
});
