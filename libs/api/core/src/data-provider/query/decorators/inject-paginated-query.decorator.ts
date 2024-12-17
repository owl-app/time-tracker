import { Inject } from '@nestjs/common';

import { Class } from '@owl-app/nestjs-query-core';
import { getPaginatedQueryServiceToken } from './helpers';

export const InjectPaginatedQueryService = <DTO>(DTOClass: Class<DTO>): ReturnType<typeof Inject> =>
  Inject(getPaginatedQueryServiceToken(DTOClass));
