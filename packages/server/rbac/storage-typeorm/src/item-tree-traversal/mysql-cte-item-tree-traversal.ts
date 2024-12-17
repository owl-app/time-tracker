import { CteItemTreeTraversal } from './cte-item-tree-traversal';
import { RawItem } from '../types';

export class MysqlCteItemTreeTraversal extends CteItemTreeTraversal<RawItem> {
  protected getEmptyChildrenExpression(): string {
    return "CAST('' AS CHAR(21844))";
  }
}
