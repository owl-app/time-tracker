import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdatePermissionRequest {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  description?: string | null;
}
