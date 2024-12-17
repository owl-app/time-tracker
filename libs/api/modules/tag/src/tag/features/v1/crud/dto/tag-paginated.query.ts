import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { PaginatedQuery } from '@owl-app/lib-api-core/pagination/paginated.query';

export class TagPaginatedQuery extends PaginatedQuery {
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ enum: [0, 1], example: 0, description: 'Is pageable', required: false })
  @IsIn([0, 1])
  readonly pageable?: number;
}
