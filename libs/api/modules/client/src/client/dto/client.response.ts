import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, TransformFnParams } from 'class-transformer';

import { type Tenant } from '@owl-app/lib-contracts';

export class ClientResponse {
  @ApiProperty({ type: () => String })
  id?: string;

  @ApiProperty({ type: () => String })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  name?: string;

  @ApiProperty({ type: () => Boolean })
  archived?: boolean;

  @Exclude()
  tenant?: Tenant;
}
