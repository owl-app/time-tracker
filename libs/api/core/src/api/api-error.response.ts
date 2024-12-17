import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  readonly error: string;

  @ApiProperty({ example: 'Invalid data' })
  readonly message: string;

  @ApiProperty({ example: 'YevPQs' })
  readonly correlationId: string;

  constructor(body: ApiErrorResponse) {
    this.statusCode = body.statusCode;
    this.error = body.error;
    this.message = body.message;
    this.correlationId = body.correlationId;
  }
}
