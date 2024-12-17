import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUserRequest } from '@owl-app/lib-contracts';

export class UserRequest implements IUserRequest {
  @ApiProperty({ type: () => String })
  email: string;

  @ApiProperty({ type: () => String })
  password?: string;

  @ApiPropertyOptional({ type: () => String })
  readonly firstName?: string;

  @ApiPropertyOptional({ type: () => String })
  readonly lastName?: string;

  @ApiPropertyOptional({ type: () => String })
  readonly phoneNumber?: string;
}
