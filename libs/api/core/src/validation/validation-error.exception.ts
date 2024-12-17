import { FlatErrors } from 'valibot';

export type ApiErrors = FlatErrors<undefined>;

export class ValidationErrorException extends Error {
  constructor(private errors: FlatErrors<undefined>, message = 'Validation error') {
    super(message);
  }

  getErrors(): FlatErrors<undefined> {
    return this.errors;
  }
}
