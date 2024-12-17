import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from '@owl-app/lib-api-core/pagination/paginated.response';

import { ProjectResponse } from '../../../../dto/project.response';

export class ProjectPaginatedResponse extends PaginatedResponse<ProjectResponse> {
  @ApiProperty({ type: ProjectResponse, isArray: true })
  readonly items: readonly ProjectResponse[];
}
