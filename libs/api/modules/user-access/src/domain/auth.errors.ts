import { ExceptionBase } from '@owl-app/lib-api-core/exceptions/exception.base';

export class InvalidAuthenticationError extends ExceptionBase {
  static readonly message = 'Invalid login or email';

  public readonly code = 'USER.INVALID_AUTHENTICATION';

  constructor(cause?: Error, metadata?: unknown) {
    super(InvalidAuthenticationError.message, cause, metadata);
  }
}
