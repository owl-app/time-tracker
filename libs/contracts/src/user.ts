import { Role } from './rbac';
import { Tenant } from './tenant';
import { Timestampable } from './timestampable';

export interface User extends Timestampable {
  id: string;
  tenant: Tenant;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  passwordHash?: string;
  isActive?: boolean;
  hashRefreshToken?: string;
  lastLogin?: Date;
  language?: string;
  roles: Role[];
  registrationToken: string;
}

export type UserAware = {
  user: User;
};

export interface IUserRegistrationInput {
  user: User;
  password?: string;
  confirmPassword?: string;
  originalUrl?: string;
  organizationId?: string;
  createdById?: string;
  isImporting?: boolean;
  sourceId?: string;
}

export interface IUserLoginRequest {
  email: string;
  password: string;
}

export interface IUserWithPermission {
  user: User;
}

export interface IUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface IUserResponse {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
