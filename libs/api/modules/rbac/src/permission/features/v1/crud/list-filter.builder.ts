import { Permission } from '@owl-app/lib-contracts';
import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter } from '@owl-app/nestjs-query-core';

import { FilterPermissionDto } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<Permission, FilterPermissionDto> {
  build(data: FilterPermissionDto): Filter<Permission> {
    const filters: Filter<Permission>[] = [];

    if (data?.search) {
      filters.push(this.filterRegistry.get('string').apply(['name'], data?.search));
    }

    if (data?.refer) {
      filters.push({ refer: { eq: data?.refer } });
    }

    if (data?.collection) {
      filters.push({ collection: { eq: data?.collection } });
    }

    return {
      and: filters,
    };
  }
}
