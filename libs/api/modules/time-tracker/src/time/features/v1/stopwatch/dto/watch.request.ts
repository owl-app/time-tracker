import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { Project, Tag } from '@owl-app/lib-contracts';

export class WatchRequest {
  @ApiProperty({ type: () => String })
  description: string;

  @ApiPropertyOptional({ type: () => Object })
  project: Project;

  @ApiProperty({ type: () => [String] })
  tags: Tag[];
}
