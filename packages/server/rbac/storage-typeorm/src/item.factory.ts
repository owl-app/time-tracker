import { AccessType } from '@owl-app/rbac-manager';

/**
 * An interface for retrieving hierarchical RBAC items' data in a more efficient way depending on used RDBMS and their
 * versions.
 */
export interface ItemFactory<RawItem> {
  create(item: RawItem): AccessType;
}
