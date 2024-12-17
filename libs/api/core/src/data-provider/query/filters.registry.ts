import { RegistryServiceModule } from '@owl-app/registry-nestjs';
import { Filter as FilterQueryService } from '@owl-app/nestjs-query-core';

import { DATA_PROVIDER_FILTER_REGISTRY, DATA_PROVIDER_FILTER_CUSTOM_REGISTRY } from '../contants';
import { Filter } from '../filtering/filter';
import { FilterCustom } from '../filtering/filter-custom';

import { StringFilter } from './filters/string';
import { ArchivedFilter } from './filters/archived';

export const FiltersRegistry = RegistryServiceModule.forFeature<
  Filter<FilterQueryService<unknown>>
>({
  name: DATA_PROVIDER_FILTER_REGISTRY,
  services: {
    string: StringFilter,
  },
});

export const FitersCustomRegistry = RegistryServiceModule.forFeature<FilterCustom<unknown>>({
  name: DATA_PROVIDER_FILTER_CUSTOM_REGISTRY,
  services: {
    archived: ArchivedFilter,
  },
});
