import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { IUpdatePermissionRequest } from '@owl-app/lib-contracts';

import { BaseRbacItemRequest } from '../../../../../common/dto/base/base-item.request.dto';

export class UpdatePermissionRequest
  extends BaseRbacItemRequest
  implements IUpdatePermissionRequest
{
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  collection: string;

  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  refer: string;
}
