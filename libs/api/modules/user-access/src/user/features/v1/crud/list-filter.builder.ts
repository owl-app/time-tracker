import { User } from '@owl-app/lib-contracts';
import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter, SelectRelation } from '@owl-app/nestjs-query-core';

import { FilterUserDto } from './dto';

export class ListFilterBuilder extends QueryFilterBuilder<User, FilterUserDto> {
  build(data: FilterUserDto): Filter<User> {
    const filters: Filter<User>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['email'], data?.search));

    return {
      or: filters,
    };
  }

  buildRelations(): SelectRelation<User>[] {
    return [
      {
        name: 'roles',
        query: {
          relations: [
            {
              name: 'setting',
              query: {},
            },
          ],
        },
      },
    ];
  }
}
