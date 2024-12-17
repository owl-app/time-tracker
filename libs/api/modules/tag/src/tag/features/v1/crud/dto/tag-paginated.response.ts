import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '@owl-app/lib-api-core/pagination/paginated.response';

import { TagResponse } from '../../../../dto/tag.response';

export class TagPaginatedResponse extends PaginatedResponse<TagResponse> {
  @ApiProperty({ type: TagResponse, isArray: true })
  readonly items: readonly TagResponse[];
}
