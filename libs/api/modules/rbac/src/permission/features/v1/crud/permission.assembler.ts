import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { PermissionEntity } from '../../../../domain/entity/permission.entity';
import { PermissionResponse } from './dto/permission.response.dto';

@Assembler(PermissionResponse, PermissionEntity)
export class PermissionAssembler extends ClassTransformerAssembler<
  PermissionResponse,
  PermissionEntity
> {}
