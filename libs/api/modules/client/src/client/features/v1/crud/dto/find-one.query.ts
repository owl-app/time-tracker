import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class FindOneQuery {
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ enum: [0, 1], example: 0, description: 'With projects', required: false })
  @IsIn([0, 1])
  readonly withProjects?: number;
}
