import { Item, TypesItem } from '@owl-app/rbac-manager';

export type Hierarchy = Item & {
  children: string | null;
};

export type RawItem = {
  type: TypesItem.PERMISSION | TypesItem.ROLE;
  name: string;
  description: string | null;
  rule_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type RawItemChild = {
  parent: string;
  child: string;
};
