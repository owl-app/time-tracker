export class ExistingServiceException extends Error {
  constructor(context: string, identifier: string) {
    super(`Service ${identifier} exist in ${context} register`);
  }
}
