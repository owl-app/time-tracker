import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { TestBaseEntity } from './test-base.entity';

@Entity()
export class TenantEntity {
  @PrimaryColumn('uuid', { name: 'tenant_entity_pk' })
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @OneToMany('TestBaseEntity', 'tenant')
  testBaseEntities?: TestBaseEntity[];

}
