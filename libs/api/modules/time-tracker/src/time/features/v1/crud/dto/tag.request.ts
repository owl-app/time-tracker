import { ApiProperty } from '@nestjs/swagger';

export class TagRequest {
  @ApiProperty({ type: () => String })
  id: string;

  @ApiProperty({ type: () => String })
  name: string;
}
