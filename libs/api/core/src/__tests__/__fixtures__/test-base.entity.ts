import {
  Column,
  Entity,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  OneToOne,
  JoinTable,
} from 'typeorm';

import BaseEntity from '../../database/entity/base.entity';
// eslint-disable-next-line import/no-cycle
import { TenantEntity } from './tenant.entity';
// eslint-disable-next-line import/no-cycle
import { TestBaseRelation } from './test-base-relation.entity';

@Entity()
export class TestBaseEntity extends BaseEntity {
  @PrimaryColumn('uuid', { name: 'test_entity_pk' })
  testEntityPk!: string;

  @Column({ name: 'string_type' })
  stringType!: string;

  @Column({ name: 'bool_type' })
  boolType!: boolean;

  @Column({ name: 'number_type' })
  numberType!: number;

  @Column({ name: 'date_type' })
  dateType!: Date;

  @Column({ name: 'archived' })
  archived!: boolean;

  @ManyToOne('TenantEntity')
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantEntity;

  // relations
  @OneToMany('TestBaseRelation', 'testBaseEntity')
  testBaseRelations?: TestBaseRelation[];

  @ManyToOne(() => TestBaseRelation, {
    nullable: true,
  })
  @JoinColumn({ name: 'many_to_one_base_relation_id' })
  manyToOneBaseRelation?: TestBaseRelation;

  @ManyToMany(() => TestBaseRelation, (tr) => tr.manyTestBaseEntities, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinTable()
  manyTestBaseRelations?: TestBaseRelation[];

  @ManyToMany(() => TestBaseRelation, { onDelete: 'CASCADE', nullable: false })
  @JoinTable()
  manyToManyUniDirectional?: TestBaseRelation[];

  @OneToOne(() => TestBaseRelation, (relation) => relation.oneTestBaseEntity)
  @JoinColumn()
  oneTestBaseRelation?: TestBaseRelation;
}
