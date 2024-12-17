import { ApiProperty } from '@nestjs/swagger';

import type { ApiErrors } from '../validation/validation-error.exception';

export class ApiErrorValidationResponse {
  @ApiProperty({ example: { email: ['Email is required'] } })
  errors: ApiErrors;

  constructor(errors: ApiErrors) {
    this.errors = errors;
  }
}
