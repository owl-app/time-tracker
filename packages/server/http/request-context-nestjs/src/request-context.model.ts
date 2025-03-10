import { AsyncLocalStorage } from 'async_hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RequestContext<TRequest = any, TResponse = any> {
  static cls = new AsyncLocalStorage<RequestContext>();

  static get currentContext() {
    return this.cls.getStore();
  }

  constructor(public readonly req: TRequest = null, public readonly res: TResponse = null) {}
}
