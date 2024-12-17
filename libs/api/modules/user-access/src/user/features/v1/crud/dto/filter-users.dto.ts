import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FilterStringQuery } from '@owl-app/lib-api-core/data-provider/query/filters/string';
import { Transform, TransformFnParams } from 'class-transformer';

export class FilterStringApiProperty2 implements FilterStringQuery {
  @ApiPropertyOptional({ name: `filters[test][test]`, type: 'string' })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  type?: string;

  @ApiPropertyOptional({ name: `filters[test][lala]`, type: 'string' })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  value?: string;
}

export class FilterUserDto {
  readonly search?: FilterStringQuery;

  readonly email?: string;

  @ApiProperty({ type: () => FilterStringApiProperty2 })
  do_tesow_na_nested?: string;
}
