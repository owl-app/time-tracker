import { FilterStringQuery } from '@owl-app/lib-api-core/data-provider/query/filters/string';

export class FilterTimeRequest {
  readonly search?: FilterStringQuery;

  readonly email?: string;

  readonly clients?: string;

  readonly projects?: string;

  readonly tags?: string;

  readonly date?: { start: string; end: string };
}
