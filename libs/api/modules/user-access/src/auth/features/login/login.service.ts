import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IJwtTokenService, Token } from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { InjectRepository } from '@owl-app/lib-api-core/typeorm/common/typeorm.decorators';

import { UserEntity } from '../../../domain/entity/user.entity';
import { InvalidAuthenticationError } from '../../../domain/auth.errors';

import type { IUserRepository } from '../../../database/repository/user-repository.interface';

import { loginValidation } from './validation';

export class Login {
  email: string;

  password: string;

  constructor(request: Partial<Login> = {}) {
    Object.assign(this, request);
  }
}

@CommandHandler(Login)
export class LoginHandler implements ICommandHandler<Login> {
  constructor(
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService<UserEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(command: Login): Promise<Record<'accessToken' | 'refreshToken', Token>> {
    await loginValidation.validateAsync(command, { abortEarly: false });

    const user = await this.userRepository.getUserByEmail(command.email);

    if (!user || !(await this.jwtTokenService.validateToken(command.password, user.passwordHash))) {
      throw new InvalidAuthenticationError();
    }

    await this.userRepository.updateLastLogin(user.email);

    const accessToken = await this.jwtTokenService.getJwtToken(command.email);
    const refreshToken = await this.jwtTokenService.getJwtRefreshToken(command.email);

    return {
      accessToken,
      refreshToken,
    };
  }
}
