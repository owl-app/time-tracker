import { RequestEvent } from '../types/lifecycle';

export function defineRequestEvent<T extends RequestEvent>(config: T): T {
  return config;
}
