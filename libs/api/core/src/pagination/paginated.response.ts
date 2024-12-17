// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetadata, Paginated } from './pagination';

export class PaginatedMetadataResponse implements PaginationMetadata {
  @ApiProperty({
    example: 5312,
    description: 'Total number of items',
  })
  readonly total: number;
}

export abstract class PaginatedResponse<T> extends Paginated<T> {
  @ApiPropertyOptional({
    description: 'Metadata pagination',
  })
  readonly metadata: PaginatedMetadataResponse;

  @ApiProperty({ isArray: true })
  abstract readonly items: readonly T[];
}
