import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '@owl-app/lib-api-core/pagination/paginated.response';

import { TimeResponse } from '../../../../dto/time.response';

export class TimePaginatedResponse extends PaginatedResponse<TimeResponse> {
  @ApiProperty({ type: TimeResponse, isArray: true })
  readonly items: readonly TimeResponse[];
}
