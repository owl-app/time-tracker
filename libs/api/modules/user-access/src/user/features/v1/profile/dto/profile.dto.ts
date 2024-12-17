import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto {
  @ApiPropertyOptional({ type: () => String })
  firstName?: string;

  @ApiPropertyOptional({ type: () => String })
  lastName?: string;

  @ApiPropertyOptional({ type: () => String })
  phoneNumber?: string;
}
