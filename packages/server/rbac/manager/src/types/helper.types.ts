import { Assignment } from './assignment';
import { Permission } from './permission';
import { Role } from './role';

export type AllItemTypes = {
  [key: string]: Record<string, Assignment>;
};

export type UserId<T = object> =
  | string
  | number
  | ({ id: number | string } & {
      [K in keyof T]: K extends 'id' ? unknown : string;
    });

export type CallbackDefaultRoleNames = () => Array<string>;

export type AccessType = Role | Permission;
