import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class BaseRbacItemRequest {
  @ApiProperty({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  name: string;

  @ApiPropertyOptional({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  description?: string | null;

  @ApiPropertyOptional({ type: () => String })
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => (params.value ? params.value.trim() : null))
  ruleName?: string | null = null;
}
