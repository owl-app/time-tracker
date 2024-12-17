import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { Assembler, ClassTransformerAssembler, DeepPartial } from '@owl-app/nestjs-query-core';

import { UserEntity } from '../../../../domain/entity/user.entity';
import { UserDto } from '../../../dto/user.dto';
import mapper from '../../../mapping';

import { CreateUserRequest } from './dto';

@Assembler(UserDto, UserEntity)
export class UserAssembler extends ClassTransformerAssembler<UserDto, UserEntity> {
  @Inject(ConfigService)
  configService: ConfigService;

  async convertToCreateEntity(dto: CreateUserRequest): Promise<DeepPartial<UserEntity>> {
    const model = new UserEntity();
    const { passwordBcryptSaltRounds } = this.configService.get<IConfigApp>(APP_CONFIG_NAME);

    model.passwordHash = await bcrypt.hash(dto.password, passwordBcryptSaltRounds);
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.email = dto.email;
    model.phoneNumber = dto.phoneNumber;
    model.roles = [dto.role];

    return model;
  }

  async convertAsyncToDTO(user: Promise<UserEntity>): Promise<UserDto> {
    const createdUser = await user;
    const dto = new UserDto();

    dto.role = createdUser?.roles?.pop() ?? null;

    return mapper.map<UserEntity, UserDto>(createdUser, dto);
  }

  convertToDTO(user: UserEntity): UserDto {
    const dto = new UserDto();
    dto.role = user.roles?.pop();

    return mapper.map<UserEntity, UserDto>(user, dto);
  }

  async convertToUpdateEntity(dto: UserDto): Promise<UserEntity> {
    const { passwordBcryptSaltRounds } = this.configService.get<IConfigApp>(APP_CONFIG_NAME);

    const model = new UserEntity();
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.email = dto.email;
    model.phoneNumber = dto.phoneNumber;
    model.roles = [dto.role];

    if (dto.password) {
      model.passwordHash = await bcrypt.hash(dto.password, passwordBcryptSaltRounds);
    }

    return model;
  }
}
