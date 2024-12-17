import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

import { IUpdateRoleRequest } from '@owl-app/lib-contracts';

import { BaseRbacItemRequest } from '../../common/dto/base/base-item.request.dto';
import { RoleSettingRequest } from './role-setting.request.dto';

export class UpdateRoleRequest extends BaseRbacItemRequest implements IUpdateRoleRequest {
  @ApiProperty({ type: () => RoleSettingRequest })
  @IsNotEmpty()
  @Expose()
  setting: RoleSettingRequest;
}
