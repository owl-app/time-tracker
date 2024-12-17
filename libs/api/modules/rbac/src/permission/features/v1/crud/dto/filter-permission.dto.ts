import { FilterStringQuery } from '@owl-app/lib-api-core/data-provider/query/filters/string';

export class FilterPermissionDto {
  readonly search?: FilterStringQuery;

  readonly email?: string;

  readonly refer?: string;

  readonly collection?: string;
}
