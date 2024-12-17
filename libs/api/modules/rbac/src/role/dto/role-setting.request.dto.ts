import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class RoleSettingRequest {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  displayName: string;

  @ApiPropertyOptional({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  theme?: string | null;
}
