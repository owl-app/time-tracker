import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { UserEntity } from '../../../../domain/entity/user.entity';

import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileRequest } from './dto/update-profile.request';

@Assembler(ProfileDto, UserEntity)
export class ProfileAssembler extends ClassTransformerAssembler<ProfileDto, UserEntity> {
  @Inject(ConfigService)
  configService: ConfigService;

  async convertAsyncToDTO(user: Promise<UserEntity>): Promise<ProfileDto> {
    const userEntity = await user;
    const dto = new ProfileDto();

    dto.firstName = userEntity.firstName;
    dto.lastName = userEntity.lastName;
    dto.phoneNumber = userEntity.phoneNumber;

    return dto;
  }

  async convertToUpdateEntity(dto: UpdateProfileRequest): Promise<UserEntity> {
    const { passwordBcryptSaltRounds } = this.configService.get<IConfigApp>(APP_CONFIG_NAME);

    const model = new UserEntity();
    model.firstName = dto.firstName;
    model.lastName = dto.lastName;
    model.phoneNumber = dto.phoneNumber;

    if (dto.passwordNew) {
      model.passwordHash = await bcrypt.hash(dto.passwordNew, passwordBcryptSaltRounds);
    }

    return model;
  }
}
