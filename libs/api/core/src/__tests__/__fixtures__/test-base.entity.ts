import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import BaseEntity from '../../database/entity/base.entity';

@Entity()
export class TestBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'test_entity_pk' })
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @Column({ name: 'bool_type' })
  boolType!: boolean;

  @Column({ name: 'number_type' })
  numberType!: number;

  @Column({ name: 'date_type' })
  dateType!: Date;
}
