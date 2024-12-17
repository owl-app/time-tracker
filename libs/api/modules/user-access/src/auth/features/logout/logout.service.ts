import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IJwtTokenService } from '@owl-app/lib-api-core/passport/jwt-token.interface';

import { UserEntity } from '../../../domain/entity/user.entity';

export class Logout {
  email: string;

  constructor(request: Partial<Logout> = {}) {
    Object.assign(this, request);
  }
}

@CommandHandler(Logout)
export class LogoutHandler implements ICommandHandler<Logout> {
  constructor(
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService<UserEntity>
  ) {}

  async execute(data: Logout): Promise<void> {
    await this.jwtTokenService.removeRefreshToken(data.email);
  }
}
