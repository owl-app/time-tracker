import { ObjectLiteral, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, registerAs } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { getDataSourceToken } from '@nestjs/typeorm';

import { dbRefresh } from '@owl-app/testing';
import { convertToSnakeCase } from '@owl-app/utils';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';

import { DB_CONFIG_NAME } from '../../../config/db';
import { NotFoundException } from '../../../exceptions/exceptions';
import { DatabaseModule } from '../../../database/database.module';
import { InjectableRepository } from '../../../database/repository/injectable.repository';
import { AppTypeOrmModule } from '../../../typeorm/app-typeorm.module';
import { getRepositoryToken } from '../../../typeorm/common/typeorm.utils';
import { ArchiveService, DefaultArchiveService } from '../../../actions/archive/archive.service';
import ArchiveRequest from '../../../actions/archive/archive.request';
import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../../../registry/constants';
import { FilterQuery } from '../../../registry/interfaces/filter-query';
import { EntitySetter } from '../../../registry/interfaces/entity-setter';

import { getDbConfig } from '../../config/db';
import TenantSeeder from '../../seeds/tenant.seed';
import TestEntitySeeder from '../../seeds/test-entity.seed';
import { TestBaseEntity } from '../../__fixtures__/test-base.entity';
import { TEST_BASE_ENTITIES_CREATED } from '../../seeds/data/tes-base-entity.data';
import { en } from '@faker-js/faker';

describe('DefaultArchiveService', () => {
  let moduleRef: TestingModule;
  let defaultArchiveService: DefaultArchiveService<TestBaseEntity>;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
        }),
        DatabaseModule,
        AppTypeOrmModule.forFeature({
          entities: [
            {
              entity: TestBaseEntity,
              repository: InjectableRepository,
            },
          ],
        }),
        EventEmitterModule.forRoot({
          ignoreErrors: true,
        }),
        RegistryServiceModule.forFeature<FilterQuery<ObjectLiteral>>({
          name: FILTER_REGISTRY_TENANT,
          services: {},
        }),
        RegistryServiceModule.forFeature<EntitySetter<ObjectLiteral>>({
          name: SETTER_REGISTRY_TENANT,
          services: {},
        }),
      ],
      providers: [
        {
          provide: ArchiveService,
          useFactory: (repository: InjectableRepository<TestBaseEntity>) =>
            new DefaultArchiveService(repository),
          inject: [getRepositoryToken(TestBaseEntity)],
        },
      ],
    }).compile();

    defaultArchiveService = moduleRef.get(ArchiveService);

    await dbRefresh({
      dataSource: moduleRef.get(getDataSourceToken()),
      seeds: [TenantSeeder, TestEntitySeeder],
    });
  });

  afterEach(async () => {
    const dataSource = moduleRef.get(getDataSourceToken());
    await dataSource.destroy();
  });

  it('should update entity and save when found', async () => {
    const entity = TEST_BASE_ENTITIES_CREATED.filter((baseEntity) => !baseEntity.archived)[0];
    const request = new ArchiveRequest();
    const spyEmitAsync = jest.spyOn(moduleRef.get(EventEmitter2), 'emitAsync');
    const repository = jest.spyOn(
      moduleRef.get(getRepositoryToken(TestBaseEntity)) as Repository<TestBaseEntity>,
      'save'
    );

    request.archived = true;
    await defaultArchiveService.execute(entity.testEntityPk, request);

    expect(spyEmitAsync).toHaveBeenCalledWith(
      `${convertToSnakeCase(entity.constructor.name)}_ARCHIVED`,
      expect.objectContaining({ archived: true })
    );
    expect(repository).toHaveBeenCalledWith(expect.objectContaining({ archived: true }));
  });

  it('should throw NotFoundException if entity not found', async () => {
    const request = new ArchiveRequest();
    request.archived = true;

    await expect(defaultArchiveService.execute('nonexistent-id', request)).rejects.toThrow(
      NotFoundException
    );
  });
});
