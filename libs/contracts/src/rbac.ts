/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Role {
  name: string;
  description?: string;
  ruleName?: string;
  setting: RoleSetting;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  name: string;
  description?: string;
  ruleName?: string;
  refer?: string;
  collection?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum PermissionReferType {
  ROUTE = 'Route',
  FIELD = 'Field',
}

export type RoleSetting = {
  id?: string;
  displayName?: string;
  theme?: string;
};

export interface RbacItemResponse {
  name: string;
  description: string;
  ruleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRbacResponse extends RbacItemResponse {}

export interface RoleRbacResponse extends RbacItemResponse {}

export interface IBaseRbacItemRequest {
  name: string;
  description?: string;
  ruleName?: string;
}

export interface ICreatePermissionRequest extends IBaseRbacItemRequest {}

export interface IUpdatePermissionRequest extends IBaseRbacItemRequest {}

export interface ICreateRoleRequest extends IBaseRbacItemRequest {}

export interface IUpdateRoleRequest extends IBaseRbacItemRequest {}

export enum RolesEnum {
  ROLE_ADMIN_SYSTEM = 'ROLE_ADMIN_SYSTEM',
  ROLE_ADMIN_COMPANY = 'ROLE_ADMIN_COMPANY',
  ROLE_USER = 'ROLE_USER',
}
