export interface Registry<T> {
  all(): Record<string, T>;

  register(identifier: string, service: T): void;

  /**
   * @throws NonExistingServiceException
   */
  unregister(identifier: string): void;

  has(identifier: string): boolean;

  /**
   * @throws NonExistingServiceException
   */
  get(identifier: string): T;
}
