import { TypeMapper } from 'ts-mapper';

import { UserResponseAuth } from './dto/user.response';
import { UserEntity } from '../domain/entity/user.entity';

export class Mapper extends TypeMapper {
  constructor() {
    super();
    this.config();
  }

  private config(): void {
    this.createMap<UserEntity, UserResponseAuth>()
      .map(
        (src) => src.email,
        (dest) => dest.email
      )
      .map(
        (src) => src.firstName,
        (dest) => dest.firstName
      )
      .map(
        (src) => src.lastName,
        (dest) => dest.lastName
      );
  }
}

const mapper = new Mapper();

export default mapper;
