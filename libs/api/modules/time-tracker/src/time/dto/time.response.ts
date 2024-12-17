import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, TransformFnParams } from 'class-transformer';

import type { Tenant, Tag, User, Project } from '@owl-app/lib-contracts';

export class TimeResponse {
  @ApiProperty({ type: () => String })
  id?: string;

  @ApiProperty({ type: () => String })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  description?: string;

  @ApiProperty({ type: () => String })
  timeIntervalStart?: string;

  @ApiProperty({ type: () => String })
  timeIntervalEnd?: string;

  @ApiProperty({ type: () => [Object] })
  project?: Partial<Project>;

  @ApiProperty({ type: () => [Object] })
  tags?: Tag[];

  @Exclude()
  tenant?: Tenant;

  @Exclude()
  user?: User;
}
