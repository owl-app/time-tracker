import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '@owl-app/lib-api-core/pagination/paginated.response';

import { PermissionResponse } from './permission.response.dto';

export class PermissionPaginatedResponseDto extends PaginatedResponse<PermissionResponse> {
  @ApiProperty({ type: PermissionResponse, isArray: true })
  readonly items: readonly PermissionResponse[];
}
