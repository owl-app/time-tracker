import { SelectQueryBuilder } from 'typeorm';

import { AvalilableCollections, PermissionReferType, Time, TimeFields } from '@owl-app/lib-contracts';
import { QueryFilterBuilder } from '@owl-app/lib-api-core/data-provider/query/query-filter.builder';
import { Filter, SelectRelation } from '@owl-app/nestjs-query-core';
import { RequestContextService } from '@owl-app/lib-api-core/context/app-request-context';

import { FilterTimeRequest } from '../../../dto';

export class ListFilterBuilder extends QueryFilterBuilder<Time, FilterTimeRequest> {
  build(data: FilterTimeRequest): Filter<Time> {
    const filters: Filter<Time>[] = [];

    filters.push(this.filterRegistry.get('string').apply(['description'], data?.search));

    if (data?.clients) {
      filters.push({ project: { client: { id: { in: data?.clients?.split(',') } } } });
    }

    if (data?.projects) {
      filters.push({ project: { id: { in: data?.projects?.split(',') } } });
    }

    if (data?.tags) {
      filters.push({ tags: { id: { in: data?.tags?.split(',') } } });
    }

    if (this.hasPermissionColumnUser() && data?.users) {
      filters.push({ user: { id: { in: data?.users?.split(',') } } });
    }

    filters.push({ timeIntervalEnd: { isNot: null } });

    return {
      and: filters,
    };
  }

  buildCustom(data: FilterTimeRequest, qb: SelectQueryBuilder<Time>): void {
    if (data?.date?.start) {
      qb.andWhere(`DATE_FORMAT(${qb.alias}.timeIntervalStart, '%Y-%m-%d') >= :dateStart`);
      qb.setParameters({ dateStart: data?.date?.start });
    }

    if (data?.date?.end) {
      qb.andWhere(`DATE_FORMAT(${qb.alias}.timeIntervalStart, '%Y-%m-%d') <= :dateEnd`);
      qb.setParameters({ dateEnd: data?.date?.end });
    }
  }

  buildRelations(): SelectRelation<Time>[] {
    const relations = [
      {
        name: 'project',
        query: {},
      }
    ];

    if (this.hasPermissionColumnUser()) {
      relations.push({
        name: 'user',
        query: {},
      })
    }

    return relations;
  }

  private hasPermissionColumnUser(): boolean
  {
    const columnUserPsermission = `${PermissionReferType.FIELD}_${AvalilableCollections.TIME}_${TimeFields.LIST_COLUMN_USER}`;

    return RequestContextService.getCurrentUser().permissions.fields.includes(columnUserPsermission.toLocaleUpperCase());
  }
}
