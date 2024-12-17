import { AccessType, Role, TypesItem } from '@owl-app/rbac-manager';

import { ItemFactory, RawItem } from '@owl-app/rbac-storage-typerom';

import { Permission } from './types/permission';

export type ExtendedRawItem = RawItem & {
  refer: string;
  collection: string;
};

export class ExtendedItemFactory implements ItemFactory<ExtendedRawItem> {
  create(rawItem: ExtendedRawItem): AccessType {
    const properties = [
      rawItem.name,
      rawItem.description,
      rawItem.rule_name,
      rawItem.created_at !== null ? new Date(rawItem.created_at) : null,
      rawItem.updated_at !== null ? new Date(rawItem.updated_at) : null,
    ] as const;

    if (rawItem.type === TypesItem.PERMISSION) {
      return new Permission(...properties, rawItem.collection, rawItem.refer);
    }

    return new Role(...properties);
  }
}
