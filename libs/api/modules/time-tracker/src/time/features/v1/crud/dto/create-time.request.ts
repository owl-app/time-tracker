import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@owl-app/lib-contracts';
import { TagRequest } from './tag.request';

export class CreateTimeRequest {
  @ApiProperty({ type: () => String })
  description: string;

  @ApiProperty({ type: () => String })
  timeIntervalStart: string;

  @ApiProperty({ type: () => String })
  timeIntervalEnd: string;

  @ApiProperty({ type: () => [TagRequest] })
  tags?: Tag[];
}
