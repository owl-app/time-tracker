import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Transform, TransformFnParams } from 'class-transformer';

import type { Client, Tenant } from '@owl-app/lib-contracts';

export class ProjectResponse {
  @ApiProperty({ type: () => String })
  id?: string;

  @ApiProperty({ type: () => String })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  name?: string;

  @ApiProperty({ type: () => Boolean })
  archived?: boolean;

  @ApiPropertyOptional({ type: () => Object })
  client?: Client;

  @Exclude()
  tenant?: Tenant;
}
