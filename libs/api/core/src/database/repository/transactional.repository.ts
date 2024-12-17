import { EntityManager, Repository } from 'typeorm';

import { RequestContextService } from '../../context/app-request-context';

export class TransactionalRepository<Entity> extends Repository<Entity> {
  /**
   * start a global transaction to save
   * results of all event handlers in one operation
   */
  public async transaction<T>(handler: () => Promise<T>): Promise<T> {
    const resultTransaction = await this.getManager().transaction(async (connection) => {
      if (!RequestContextService.getTransactionConnection()) {
        RequestContextService.setTransactionConnection(connection);
      }

      try {
        const result = await handler();

        return result;
      } finally {
        RequestContextService.cleanTransactionConnection();
      }
    });

    return resultTransaction;
  }

  /**
   * Get database manager.
   * If global request transaction is started,
   * returns a transaction manager.
   */
  protected getManager(): EntityManager {
    return RequestContextService.getContext().transactionManager ?? this.manager;
  }
}
