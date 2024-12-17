import { ApiProperty } from '@nestjs/swagger';

export class RegistrationRequest {
  @ApiProperty({ required: true, example: 'register@wp.pl' })
  readonly email: string;

  @ApiProperty({ required: true, example: 'test' })
  readonly passwordNew: string;
}
