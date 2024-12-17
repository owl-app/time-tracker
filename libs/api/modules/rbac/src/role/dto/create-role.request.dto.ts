import { ApiProperty } from '@nestjs/swagger';

import { ICreateRoleRequest } from '@owl-app/lib-contracts';

import { BaseRbacItemRequest } from '../../common/dto/base/base-item.request.dto';

import { RoleSettingRequest } from './role-setting.request.dto';

export class CreateRoleRequest extends BaseRbacItemRequest implements ICreateRoleRequest {
  @ApiProperty({ type: () => RoleSettingRequest })
  setting: RoleSettingRequest;
}
