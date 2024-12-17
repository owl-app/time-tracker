import { Role, Tenant, Time, User } from '@owl-app/lib-contracts';

import BaseEntity from '@owl-app/lib-api-core/database/entity/base.entity';

import { UserRegisteredDomainEvent } from '../events/user-registered.domain-event';

import { RegisterUserProps } from '../user.types';

export class UserEntity extends BaseEntity implements User {
  id: string;

  tenant: Tenant;

  times: Time[];

  email: string;

  username?: string;

  firstName?: string;

  lastName?: string;

  phoneNumber?: string;

  passwordHash?: string;

  isActive?: boolean;

  hashRefreshToken?: string;

  lastLogin?: Date;

  roles: Role[];

  registrationToken: string;

  static register(registerProps: RegisterUserProps): UserEntity {
    const user = new UserEntity();
    Object.assign(user, registerProps);

    user.addEvent(
      new UserRegisteredDomainEvent({
        email: registerProps.email,
      })
    );

    return user;
  }
}
