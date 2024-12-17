import { RequestContext } from '@owl-app/request-context-nestjs';
import { AuthUserData } from '@owl-app/lib-contracts';
import { EntityManager } from 'typeorm';

export class AppRequestContext extends RequestContext {
  requestId: string;

  user: AuthUserData;

  transactionManager?: EntityManager;
}

export class RequestContextService {
  static getContext(): AppRequestContext {
    const ctx: AppRequestContext = RequestContext.currentContext?.req;
    return ctx;
  }

  static getRequestId(): string {
    return this.getContext()?.requestId;
  }

  static getTransactionConnection(): EntityManager | undefined {
    const ctx = this.getContext();
    return ctx.transactionManager;
  }

  static setTransactionConnection(transactionManager?: EntityManager): void {
    const ctx = this.getContext();
    ctx.transactionManager = transactionManager;
  }

  static cleanTransactionConnection(): void {
    const ctx = this.getContext();
    ctx.transactionManager = undefined;
  }

  static getCurrentUser(): AuthUserData | null {
    const requestContext = this.getContext();
    return (requestContext && requestContext.user) || null;
  }

  static getCurrentUserId(): string | null {
    const user: AuthUserData | null = RequestContextService.getCurrentUser();
    if (user) {
      return user.id;
    }

    return null;
  }
}
