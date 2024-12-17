import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

import { ValidationErrorException } from '../validation/validation-error.exception';

@Catch()
export class ErrorHandlersFilter extends BaseExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const applicationRef =
      this.applicationRef || (this.httpAdapterHost && this.httpAdapterHost.httpAdapter);

    if (exception instanceof ValidationErrorException) {
      const response = host.switchToHttp().getResponse<Response>();

      applicationRef.reply(
        response,
        new ValidationErrorException(exception.getErrors()),
        HttpStatus.UNPROCESSABLE_ENTITY
      );

      return;
    }

    super.catch(exception, host);
  }
}
