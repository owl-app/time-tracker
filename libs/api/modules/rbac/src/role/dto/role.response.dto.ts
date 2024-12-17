import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, TransformFnParams, Type } from 'class-transformer';

import { RoleRbacResponse } from '@owl-app/lib-contracts';

import { BaseRbacItemResponse } from '../../common/dto/base/base-item.response.dto';

export class RoleSettingResponse {
  @Exclude()
  role: BaseRbacItemResponse;

  @Exclude()
  id: number;

  @ApiProperty({ type: () => String })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  displayName: string;

  @ApiProperty({ type: () => String })
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  theme?: string | null;
}

export class RoleResponse extends BaseRbacItemResponse implements RoleRbacResponse {
  @ApiProperty({ type: () => RoleSettingResponse })
  @Expose()
  @Type(() => RoleSettingResponse)
  setting: RoleSettingResponse;
}
