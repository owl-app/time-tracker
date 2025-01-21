import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { TestBaseEntity } from './test-base.entity';

@Entity()
export class TestBaseRelation {
  @PrimaryColumn({ name: 'test_base_relation_pk' })
  testBaseRelationPk!: string;

  @Column({ name: 'relation_name' })
  relationName!: string;

  // @Column({ name: 'test_base_entity_id', nullable: true })
  // testBaseEntityId?: string;

  // @Column({ name: 'uni_directional_test_base_entity_id', nullable: true })
  // uniDirectionalTestBaseEntityId?: string;

  // @ManyToOne(() => TestBaseEntity, (te) => te.testBaseRelations, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'test_base_entity_id' })
  // testBaseEntity?: TestBaseEntity;

  // @ManyToOne(() => TestBaseEntity, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'uni_directional_test_base_entity_id' })
  // testBaseEntityUniDirectional?: TestBaseEntity;

  // @ManyToMany(() => TestBaseEntity, (te) => te.manyTestBaseRelations, {
  //   onDelete: 'CASCADE',
  //   nullable: false,
  // })
  // manyTestBaseEntities?: TestBaseEntity[];

  // @OneToOne(() => TestBaseEntity, (entity) => entity.oneTestBaseRelation)
  // oneTestBaseEntity?: TestBaseEntity;
}
