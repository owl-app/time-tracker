export class NonExistingServiceException extends Error {
  constructor(context: string, identifier: string, existServices: Array<string>) {
    super(
      `Service ${identifier} does not exist in register ${context}, available services: ${existServices.join(
        ', '
      )}`
    );
  }
}
