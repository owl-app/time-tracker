export const RBAC_CONFIG_NAME = 'rbac';

export interface IRbacConfig {
  itemTableName: string;
  itemChildrenTableName: string | null;
  assigmentsTable: string;
}
