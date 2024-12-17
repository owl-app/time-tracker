import { FilterStringQuery } from '@owl-app/lib-api-core/data-provider/query/filters/string';
import { ArchiveOptions } from '@owl-app/lib-contracts';

/**
 * Filter User DTO
 */
export class FilterClientDto {
  readonly search?: FilterStringQuery;

  readonly email?: string;

  readonly archived?: ArchiveOptions;
}
