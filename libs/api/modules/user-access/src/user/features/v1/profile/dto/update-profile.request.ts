import { ApiPropertyOptional } from '@nestjs/swagger';

import { ProfileDto } from './profile.dto';

export class UpdateProfileRequest extends ProfileDto {
  @ApiPropertyOptional({ type: () => String })
  passwordNew?: string;

  @ApiPropertyOptional({ type: () => String })
  passwordNewRepeat?: string;
}
