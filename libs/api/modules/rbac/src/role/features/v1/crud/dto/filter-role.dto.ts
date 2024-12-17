import { FilterStringQuery } from '@owl-app/lib-api-core/data-provider/query/filters/string';

/**
 * Filter User DTO
 */
export class FilterRoleDto {
  readonly search?: FilterStringQuery;

  readonly email?: string;
}
