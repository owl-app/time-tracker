import { Role } from '@owl-app/lib-contracts';

export interface RegisterUserProps {
  email: string;

  passwordHash: string;

  phoneNumber?: string;

  roles: Partial<Role>[];

  registrationToken: string;
}
