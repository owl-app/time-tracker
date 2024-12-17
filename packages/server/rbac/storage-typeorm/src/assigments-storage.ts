import { DataSource } from 'typeorm';
import moment from 'moment';

import { AllItemTypes, Assignment, AssignmentsStorage } from '@owl-app/rbac-manager';
import { isEmpty } from '@owl-app/utils';

import { BaseStorage } from './base.storage';

type RawAssignment = {
  item_name: string;
  user_id: string;
  created_at: string;
};

export class TypeOrmAssignmentsStorage extends BaseStorage implements AssignmentsStorage {
  constructor(dataSource: DataSource, readonly tableName: string) {
    super(dataSource);
  }

  async getAll(): Promise<AllItemTypes> {
    const rawAssignments: Array<RawAssignment> = await this.singleQuery(
      `SELECT * FROM ${this.tableName}`
    );
    const assignments: AllItemTypes = {};

    Object.values(rawAssignments).forEach((item: RawAssignment) => {
      assignments[item.user_id][item.item_name] = new Assignment(
        item.user_id,
        item.item_name,
        new Date(item.created_at)
      );
    });

    return assignments;
  }

  async getByUserId(userId: string): Promise<Record<string, Assignment>> {
    const rawAssignments: Array<RawAssignment> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    );
    const assignments: Record<string, Assignment> = {};

    Object.values(rawAssignments).forEach((item: RawAssignment) => {
      assignments[item.item_name] = new Assignment(
        userId,
        item.item_name,
        new Date(item.created_at)
      );
    });

    return assignments;
  }

  async getByItemNames(itemNames: string[]): Promise<Assignment[]> {
    if (!itemNames) {
      return [];
    }

    const rawAssignments = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(this.tableName, this.tableName)
      .where('item_name IN (:...names)', { itemNames })
      .getRawMany();

    const assignments: Assignment[] = [];

    rawAssignments.forEach((rawAssignment) => {
      assignments.push(
        new Assignment(
          rawAssignment.user_id,
          rawAssignment.item_name,
          new Date(rawAssignment.created_at)
        )
      );
    });

    return assignments;
  }

  async get(item_name: string, userId: string): Promise<Assignment | null> {
    const rawAssignment: RawAssignment = await this.singleQuery(
      `
      SELECT * FROM ${this.tableName} 
      WHERE item_name = ? AND user_id = ? LIMIT 1
    `,
      [item_name, userId]
    );

    return isEmpty(rawAssignment)
      ? null
      : new Assignment(
          rawAssignment.user_id,
          rawAssignment.item_name,
          new Date(rawAssignment.created_at)
        );
  }

  async exists(itemName: string, userId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('1 AS item_exists')
      .from(this.tableName, this.tableName)
      .where('item_name := itemName', { itemName })
      .andWhere('user_id := userId', { userId })
      .getRawOne();

    return result !== false;
  }

  async userHasItem(userId: string, itemNames: string[]): Promise<boolean> {
    if (!itemNames) {
      return false;
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .select('1 AS assignment_exists')
      .from(this.tableName, this.tableName)
      .where('user_id = :userId', { userId })
      .andWhere('item_name IN (:...itemNames)', { itemNames })
      .getRawOne();

    return result !== false;
  }

  async filterUserItemNames(userId: string, itemNames: string[]): Promise<string[]> {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select('item_name')
      .from(this.tableName, this.tableName)
      .where('user_id = :userId', { userId })
      .andWhere('item_name IN (:...itemNames)', { itemNames })
      .getRawMany();

    return rows.map((row) => row.item_name);
  }

  async add(item_name: string, userId: string): Promise<void> {
    await this.singleQuery(
      `INSERT INTO ${this.tableName} (item_name, user_id, created_at) VALUES(?,?,?)`,
      [item_name, userId, moment().format('YYYY-MM-DD HH:mm:ss')]
    );
  }

  async hasItem(itemName: string): Promise<boolean> {
    const result: Array<RawAssignment> = await this.singleQuery(
      `SELECT * FROM ${this.tableName} WHERE item_name = ? LIMIT 1`,
      [itemName]
    );

    return result.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renameItem(oldName: string, newName: string): void {
    // skip
  }

  async remove(itemName: string, userId: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.tableName} WHERE item_name = ? AND user_id = ?`, [
      itemName,
      userId,
    ]);
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.tableName} WHERE user_id = ?`, [userId]);
  }

  async removeByItemName(itemName: string): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.tableName} WHERE item_name = ?`, [itemName]);
  }

  async clear(): Promise<void> {
    await this.singleQuery(`DELETE FROM ${this.tableName}`);
  }
}
