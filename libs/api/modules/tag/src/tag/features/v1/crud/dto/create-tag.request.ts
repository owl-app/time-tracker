import { ApiProperty } from '@nestjs/swagger';

export class CreateTagRequest {
  @ApiProperty({ type: () => String })
  name: string;
}
