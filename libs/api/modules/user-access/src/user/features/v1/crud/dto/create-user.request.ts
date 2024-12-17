import { ApiProperty, PartialType } from '@nestjs/swagger';

import { UserDto } from '../../../../dto/user.dto';

export class CreateUserRequest extends PartialType(UserDto) {
  @ApiProperty({ type: () => String })
  password?: string;
}
