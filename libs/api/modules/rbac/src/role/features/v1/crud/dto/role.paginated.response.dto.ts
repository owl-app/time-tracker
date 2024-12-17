import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '@owl-app/lib-api-core/pagination/paginated.response';

import { RoleResponse } from '../../../../dto/role.response.dto';

export class RolePaginatedResponseDto extends PaginatedResponse<RoleResponse> {
  @ApiProperty({ type: RoleResponse, isArray: true })
  readonly items: readonly RoleResponse[];
}
