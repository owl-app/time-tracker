import { Tenant } from './tenant';
import { User } from './user';

export type AuthUserData = {
  id: string;
  username: string;
  email: string;
  tenant: Tenant;
  roles: string[];
  permissions: {
    routes: string[];
    fields: string[];
  };
  refreshToken?: string;
};

export type IAuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
