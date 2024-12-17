import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { Project, Tag } from '@owl-app/lib-contracts';

export class StopRequest {
  @ApiProperty({ type: () => String })
  description: string;

  @ApiProperty({ type: () => Object })
  project: Project;

  @ApiPropertyOptional({ type: () => [String] })
  tags: Tag[];
}
