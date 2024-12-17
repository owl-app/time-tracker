import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTagRequest } from './create-tag.request';

export class UpdateTagDto extends PartialType(CreateTagRequest) {
  @ApiProperty({ type: () => String })
  color: string;
}
