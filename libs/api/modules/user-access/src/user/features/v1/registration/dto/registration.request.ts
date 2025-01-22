import { ApiProperty } from '@nestjs/swagger';

export class RegistrationRequest {
  @ApiProperty({ required: true, example: 'register@wp.pl' })
  readonly email: string;

  @ApiProperty({ required: true, example: 'test_test' })
  readonly passwordNew: string;

  @ApiProperty({ required: true, example: 'test_test' })
  readonly passwordNewRepeat: string;
}
