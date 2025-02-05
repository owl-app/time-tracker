import { AccessType, Role, TypesItem } from '@owl-app/rbac-manager';

import { ExtendedItemFactory, ExtendedRawItem } from '../../../rbac/item.factory';
import { Permission } from '../../../rbac/types/permission';

describe('ExtendedItemFactory', () => {
  let factory: ExtendedItemFactory;

  beforeEach(() => {
    factory = new ExtendedItemFactory();
  });

  it('should create a Permission when rawItem.type is PERMISSION', () => {
    const mockRawItem: ExtendedRawItem = {
      type: TypesItem.PERMISSION,
      name: 'Test Permission',
      description: 'Permission description',
      rule_name: 'ruleTest',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-06-01T00:00:00.000Z',
      refer: 'SOME_REFER',
      collection: 'SOME_COLLECTION',
    };

    const result: AccessType = factory.create(mockRawItem);
    expect(result).toBeInstanceOf(Permission);

    const perm = result as Permission;
    expect(perm.name).toBe(mockRawItem.name);
    expect(perm.description).toBe(mockRawItem.description);
    expect(perm.ruleName).toBe(mockRawItem.rule_name);
    expect(perm.createdAt).toEqual(new Date(mockRawItem.created_at));
    expect(perm.updatedAt).toEqual(new Date(mockRawItem.updated_at));
    expect(perm.collection).toBe(mockRawItem.collection);
    expect(perm.refer).toBe(mockRawItem.refer);
  });

  it('should create a Role when rawItem.type is not PERMISSION', () => {
    const mockRawItem: ExtendedRawItem = {
      type: TypesItem.ROLE,
      name: 'Test Role',
      description: 'Role description',
      rule_name: 'ruleRole',
      created_at: null,
      updated_at: null,
      refer: 'SOME_REFER',
      collection: 'SOME_COLLECTION',
    };

    const result: AccessType = factory.create(mockRawItem);
    expect(result).toBeInstanceOf(Role);

    const role = result as Role;
    expect(role.name).toBe(mockRawItem.name);
    expect(role.description).toBe(mockRawItem.description);
    expect(role.ruleName).toBe(mockRawItem.rule_name);
    expect(role.createdAt).toBeNull();
    expect(role.updatedAt).toBeNull();
  });
});
