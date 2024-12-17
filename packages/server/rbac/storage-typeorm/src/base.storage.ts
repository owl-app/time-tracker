import { DataSource, QueryRunner } from 'typeorm';

export class BaseStorage {
  constructor(protected dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  protected async transactional(
    callback: (queryRunner: QueryRunner) => Promise<void>
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await callback(queryRunner);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async singleQuery(sql: string, parameters?: unknown[]): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    const result = await queryRunner.query(sql, parameters);
    queryRunner.release();

    return result;
  }
}
