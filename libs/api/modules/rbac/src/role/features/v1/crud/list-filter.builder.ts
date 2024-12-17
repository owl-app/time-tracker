import { Role } from '@owl-app/lib-contracts';
import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter, SelectRelation } from '@owl-app/nestjs-query-core';

import { FilterRoleDto } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<Role, FilterRoleDto> {
  build(data: FilterRoleDto): Filter<Role> {
    const filters: Filter<Role>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['name'], data?.search));

    return {
      or: filters,
    };
  }

  buildRelations(): SelectRelation<Role>[] {
    return [{ name: 'setting', query: {} }];
  }
}
