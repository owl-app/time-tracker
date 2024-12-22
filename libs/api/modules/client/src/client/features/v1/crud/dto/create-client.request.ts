import { ApiProperty } from '@nestjs/swagger';

export class CreateClientRequest {
  @ApiProperty({ type: () => String })
  name: string;

  @ApiProperty({ type: () => String })
  email: string;

  @ApiProperty({ type: () => String })
  address: string;

  @ApiProperty({ type: () => String })
  description: string;
}
