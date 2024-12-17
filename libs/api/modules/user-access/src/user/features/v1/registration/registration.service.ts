import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RolesEnum } from '@owl-app/lib-contracts';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { InjectQueryServiceRepository } from '@owl-app/lib-api-core/query/common/repository.decorator';

import { UserEntity } from '../../../../domain/entity/user.entity';
import type { IUserRepository } from '../../../../database/repository/user-repository.interface';

export class RegistrationCommand {
  email: string;

  passwordNew: string;

  constructor(request: Partial<RegistrationCommand> = {}) {
    Object.assign(this, request);
  }
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler implements ICommandHandler<RegistrationCommand> {
  constructor(
    @InjectQueryServiceRepository(UserEntity)
    readonly userRepository: IUserRepository,
    @Inject(ConfigService)
    readonly configService: ConfigService
  ) {}

  async execute(command: RegistrationCommand): Promise<void> {
    const { nanoid } = await import('nanoid');
    const { passwordBcryptSaltRounds } = this.configService.get<IConfigApp>(APP_CONFIG_NAME);
    const user = UserEntity.register({
      ...command,
      passwordHash: await bcrypt.hash(command.passwordNew, passwordBcryptSaltRounds),
      roles: [{ name: RolesEnum.ROLE_ADMIN_COMPANY }],
      registrationToken: nanoid(64),
    });

    await this.userRepository.register(user);
  }
}
