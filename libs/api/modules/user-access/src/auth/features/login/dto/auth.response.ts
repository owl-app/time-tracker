import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ type: () => Number })
  accessTokenExpires: number;

  @ApiProperty({ type: () => Number })
  refreshTokenExpires: number;
}
