import { ApiProperty } from '@nestjs/swagger';

export class CreateClientRequest {
  @ApiProperty({ type: () => String })
  name: string;
}
