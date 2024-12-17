import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

import { FilterFieldComparison, Filter as FilterQueryService } from '@owl-app/nestjs-query-core';
import { isEmpty } from '@owl-app/utils';

import { Filter } from '../../filtering/filter';

export interface FilterStringQuery {
  type?: string;
  value?: string;
}

export class FilterStringApiProperty implements FilterStringQuery {
  @ApiPropertyOptional({ name: `type`, type: () => String })
  @IsOptional()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  type?: string;

  @ApiPropertyOptional({ name: `value`, type: () => String })
  @IsOptional()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  value?: string;
}

export type StringFilterData = {
  type: string;
  value: string;
};

export class StringFilter<Entity> implements Filter<FilterQueryService<Entity>> {
  static readonly NAME = 'string';

  static readonly TYPE_EQUAL = 'equal';

  static readonly TYPE_NOT_EQUAL = 'not_equal';

  static readonly TYPE_EMPTY = 'empty';

  static readonly TYPE_NOT_EMPTY = 'not_empty';

  static readonly TYPE_CONTAINS = 'contains';

  static readonly TYPE_NOT_CONTAINS = 'not_contains';

  static readonly TYPE_STARTS_WITH = 'starts_with';

  static readonly TYPE_ENDS_WITH = 'ends_with';

  static readonly TYPE_IN = 'in';

  static readonly TYPE_NOT_IN = 'not_in';

  apply<QueryData extends FilterStringQuery>(
    fields: string[],
    data: QueryData
  ): FilterQueryService<Entity> {
    const filters: FilterQueryService<Entity> = {};

    if (
      isEmpty(data?.type) ||
      (![StringFilter.TYPE_NOT_EMPTY, StringFilter.TYPE_EMPTY].indexOf(data.type) &&
        isEmpty(data.value))
    )
      return {};

    fields.forEach((field) => {
      filters[field as keyof Entity] = this.getQuery(
        data.type,
        data.value
      ) as FilterQueryService<Entity>[keyof Entity];
    });

    return filters;
  }

  private getQuery<K extends keyof Entity>(type: string, value: string): FilterFieldComparison<K> {
    let filter = null;

    switch (type) {
      case StringFilter.TYPE_EQUAL:
        filter = { eq: `${value}` };
        break;
      case StringFilter.TYPE_NOT_EQUAL:
        filter = { neq: `${value}` };
        break;
      case StringFilter.TYPE_EMPTY:
        filter = { is: null };
        break;
      case StringFilter.TYPE_NOT_EMPTY:
        filter = { isNot: null };
        break;
      case StringFilter.TYPE_CONTAINS:
        filter = { like: `%${value}%` };
        break;
      case StringFilter.TYPE_NOT_CONTAINS:
        filter = { notLike: `%${value}%` };
        break;
      case StringFilter.TYPE_STARTS_WITH:
        filter = { like: `${value}%` };
        break;
      case StringFilter.TYPE_ENDS_WITH:
        filter = { like: `%${value}` };
        break;
      case StringFilter.TYPE_IN:
        filter = { in: value.split(',').map((item) => item) };
        break;
      case StringFilter.TYPE_NOT_IN:
        filter = { notIn: value.split(',').map((item) => item) };
        break;
      default:
        throw Error(`Filter ${type} not supported`);
    }

    return filter as FilterFieldComparison<K>;
  }
}
