import { DataSource } from 'typeorm';

import { RawItem } from '../types';
// import { SqliteCteItemTreeTraversal } from './SqliteCteItemTreeTraversal';
import { MysqlCteItemTreeTraversal } from './mysql-cte-item-tree-traversal';
import { ItemTreeTraversal } from './item-tree-traversal';

// import { PostgresCteItemTreeTraversal } from './PostgresCteItemTreeTraversal';
// import { MssqlCteItemTreeTraversal } from './MssqlCteItemTreeTraversal';
// import { OracleCteItemTreeTraversal } from './OracleCteItemTreeTraversal';

/**
 * A factory for creating item tree traversal strategy depending on used RDBMS.
 */
export class ItemTreeTraversalFactory {
  /**
   * Creates item tree traversal strategy depending on used RDBMS.
   *
   * @param database - Database connection instance.
   * @param tableName - Name of the table for storing RBAC items.
   * @param childrenTableName - Name of the table for storing relations between RBAC items.
   * @param namesSeparator - Separator used for joining item names.
   * @throws RuntimeException - When a database was configured with an unknown driver.
   * @returns ItemTreeTraversalInterface - Item tree traversal strategy.
   */
  public static getItemTreeTraversal(
    dataSource: DataSource,
    tableName: string,
    childrenTableName: string,
    namesSeparator: string
  ): ItemTreeTraversal<RawItem> {
    const driver = dataSource.options.type;
    // const args = [dataSource, tableName, childrenTableName, namesSeparator];

    switch (driver) {
      // case 'sqlite':
      //     return new SqliteCteItemTreeTraversal(...args);
      case 'mysql':
        return new MysqlCteItemTreeTraversal(
          dataSource,
          tableName,
          childrenTableName,
          namesSeparator
        );
      // case 'pgsql':
      //     return new PostgresCteItemTreeTraversal(...args);
      // case 'sqlsrv':
      //     return new MssqlCteItemTreeTraversal(...args);
      // case 'oci':
      //     return new OracleCteItemTreeTraversal(...args);
      default:
        throw new Error(`${driver} database driver is not supported.`);
    }
  }
}
