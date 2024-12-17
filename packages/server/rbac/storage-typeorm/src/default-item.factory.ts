import { AccessType, Permission, Role, TypesItem } from '@owl-app/rbac-manager';

import { ItemFactory } from './item.factory';
import { RawItem as BaseRawItem } from './types';

export class DefaultItemFactory<RawItem extends BaseRawItem> implements ItemFactory<RawItem> {
  create(rawItem: RawItem): AccessType {
    const properties = [
      rawItem.name,
      rawItem.description,
      rawItem.rule_name,
      rawItem.created_at !== null ? new Date(rawItem.created_at) : null,
      rawItem.updated_at !== null ? new Date(rawItem.updated_at) : null,
    ] as const;

    return rawItem.type === TypesItem.PERMISSION
      ? new Permission(...properties)
      : new Role(...properties);
  }
}
