import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectRequest {
  @ApiProperty({ type: () => String })
  name: string;
}
