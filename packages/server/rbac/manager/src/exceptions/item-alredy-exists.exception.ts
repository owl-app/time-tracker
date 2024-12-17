import { Item } from '../types';
import { BaseException } from './base.exception';

export class ItemAlreadyExistsException extends BaseException {
  constructor(item: Item) {
    super(`Rbac item already exists ${item.name}`);
    this.name = this.constructor.name;
  }
}
