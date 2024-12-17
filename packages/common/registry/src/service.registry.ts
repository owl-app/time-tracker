import { cloneDeep } from 'lodash';

import { ExistingServiceException } from './exception/existing.service.exception';
import { NonExistingServiceException } from './exception/non-existing.service.exception';
import type { Registry } from './types';

export class ServiceRegistry<T> implements Registry<T> {
  private services: Record<string, T> = {};

  constructor(readonly context = 'service') {}

  all(): Record<string, T> {
    const copiedServices: Record<string, T> = {};

    Object.keys(this.services).forEach((key) => {
      copiedServices[key] = cloneDeep(this.services[key]);
    });

    return copiedServices;
  }

  register(identifier: string, service: T): void {
    if (this.has(identifier)) {
      throw new ExistingServiceException(this.context, identifier);
    }

    this.services[identifier] = service;
  }

  unregister(identifier: string): void {
    if (!this.has(identifier)) {
      throw new NonExistingServiceException(
        this.context,
        identifier,
        Object.getOwnPropertyNames(this.services)
      );
    }

    delete this.services[identifier];
  }

  has(identifier: string): boolean {
    return this.services[identifier] !== undefined;
  }

  get(identifier: string): T {
    if (!this.has(identifier)) {
      throw new NonExistingServiceException(
        this.context,
        identifier,
        Object.getOwnPropertyNames(this.services)
      );
    }

    return cloneDeep(this.services[identifier]);
  }
}
