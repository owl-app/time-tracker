import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthRequest {
  @ApiProperty({ required: true, example: 'role_admin@wp.pl' })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({ required: true, example: 'test' })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
