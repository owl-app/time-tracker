import { ApiProperty } from '@nestjs/swagger';

import { UserResponseAuth } from '../../../dto/user.response';

export class UserWithPermissionResponse {
  @ApiProperty({ type: () => UserResponseAuth })
  user: UserResponseAuth;
}
