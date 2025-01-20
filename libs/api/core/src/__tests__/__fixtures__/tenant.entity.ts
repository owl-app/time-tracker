import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { TestBaseEntity } from './test-base.entity';

@Entity()
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'tenant_entity_pk' })
  tenantEntityPk!: string;

  @Column({ name: 'name' })
  name!: string;

  @OneToMany('TestBaseEntity', 'tenant')
  testBaseEntities?: TestBaseEntity[];
  
}
