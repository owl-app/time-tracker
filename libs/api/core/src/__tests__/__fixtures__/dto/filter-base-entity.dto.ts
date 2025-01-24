import { ArchiveOptions } from '@owl-app/lib-contracts';

import { FilterStringQuery } from '../../../data-provider/query/filters/string';

export class FilterBaseEntityDto {
  readonly search?: FilterStringQuery;

  readonly email?: string;

  readonly archived?: ArchiveOptions;
}
