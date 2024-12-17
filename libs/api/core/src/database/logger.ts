import { AbstractLogger, LogLevel, LogMessage, QueryRunner } from 'typeorm';

export class MyCustomLogger extends AbstractLogger {
  /**
   * Write log to specific output.
   */
  protected writeLog(level: LogLevel, logMessage: LogMessage | LogMessage[]) {
    this.prepareLogMessages(logMessage, {
      highlightSql: false,
    });
  }

  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    const requestUrl =
      queryRunner && queryRunner.data?.request ? `(${queryRunner.data?.request?.url})` : '';

    // eslint-disable-next-line no-console
    console.log(`${requestUrl} executing query: ${query}`);
  }
}
