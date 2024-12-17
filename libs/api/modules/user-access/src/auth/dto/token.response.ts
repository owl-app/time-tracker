import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({ type: () => Number })
  accessTokenExpires: number;

  @ApiProperty({ type: () => Number })
  refreshTokenExpires: number;
}
