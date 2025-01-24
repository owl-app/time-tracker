import { ObjectLiteral, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { omit } from 'lodash';

import { Inject } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { Registry } from '@owl-app/registry';
import { DeepPartial } from '@owl-app/nestjs-query-core';
import { TenantAware } from '@owl-app/lib-contracts';
import { Class } from '@owl-app/types';
import { dbInitializer, dbRefresh } from '@owl-app/testing';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

import { RequestContextService } from '../../../../context/app-request-context';
import { DB_CONFIG_NAME } from '../../../../config/db';
import { AppTypeOrmQueryService } from '../../../../query/typeorm/services/app-typeorm-query.service';
import { InjectQueryServiceRepository } from '../../../../query/common/repository.decorator';
import { TypeOrmModule } from '../../../../typeorm/typeorm.module';
import { BaseRepository } from '../../../../database/repository/base.repository';
import { TestSimpleEntity } from '../../../__fixtures__/test-simple.entity';
import { TestBaseEntity } from '../../../__fixtures__/test-base.entity';
import { getDbConfig } from '../../../config/db';
import { getQueryServiceRepositoryToken } from '../../../../query/common/repository.utils';
import TestEntitySeeder from '../../../seeds/test-entity.seed';
import TenantSeeder from '../../../seeds/tenant.seed';
import { DatabaseModule } from '../../../../database/database.module';
import {
  TEST_BASE_ENTITIES_CREATED,
  TEST_BASE_ENTITIES_NEW,
  TEST_SIMPLE_ENTITIES_CREATED,
  TEST_SIMPLE_ENTITIES_NEW,
} from '../../../seeds/data/tes-base-entity.data';
import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../../../../registry/constants';
import { FilterQuery } from '../../../../registry/interfaces/filter-query';
import { TenantRelationFilter } from '../../../../typeorm/filters/tenant-relation.filter';
import { TenantRelationSetter } from '../../../../typeorm/setters/tenant-relation.setter';
import { EntitySetter } from '../../../../registry/interfaces/entity-setter';
import { authUserData, createAuthUserData } from '../../../__fixtures__/auth-user.data';
import { TEST_TENANT_CREATED } from '../../../seeds/data/tenant.data';
import { TEST_BASE_RELATION_CREATED } from '../../../seeds/data/test-base-relation.data';
import { AppNestjsQueryTypeOrmModule } from '../../../../query/module';
import { ListFilterBuilder } from '../../../__fixtures__/list-filter.builder';
import { getPaginatedQueryServiceToken } from '../../../../data-provider/query/decorators/helpers';
import { FilterBaseEntityDto } from '../../../__fixtures__/dto/filter-base-entity.dto';
import { Paginated } from '../../../../pagination/pagination';
import { DataProvider } from '../../../../data-provider/data.provider';
import { AppAssemblerQueryService } from '../../../../query/core/services/app-assembler-query.service';
import { TestBaseAssembler } from '../../../__fixtures__/assembler/test-base.assembler';
import config, { PAGINATION_CONFIG_NAME } from '../../../../config';

describe('PaginatedQueryProvider', () => {
  let moduleRef: TestingModule;
  let paginatedQueryService: DataProvider<Paginated<TestBaseEntity>, FilterBaseEntityDto, TestBaseEntity>;
  const exceptedBaseEntity = {
    testEntityPk: expect.any(String),
    stringType: expect.any(String),
    boolType: expect.any(Boolean),
    numberType: expect.any(Number),
    dateType: expect.any(Date)
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
          RequestContextModule,
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
                registerAs(PAGINATION_CONFIG_NAME, () => ({
                    perPage: 10,
                    availablePerPage: [5, 20, 50, 100],
                  })
                ),
                registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig())),
              ],
          }),
          DatabaseModule,
          EventEmitterModule.forRoot({
            ignoreErrors: true,
          }),
          AppNestjsQueryTypeOrmModule.forFeature({
            entities: [
              {
                entity: TestBaseEntity,
                repository: BaseRepository,
                inject: [EventEmitter2],
                dataProvider: {
                  filterBuilder: ListFilterBuilder,
                },
                assembler: {
                  classService: AppAssemblerQueryService,
                  classAssembler: TestBaseAssembler,
                },
              },
            ],
          }),
      ],
    }).compile();

    await dbRefresh({
      dataSource: moduleRef.get(getDataSourceToken()),
      seeds: [TenantSeeder, TestEntitySeeder],
    });

    paginatedQueryService = moduleRef.get(getPaginatedQueryServiceToken(TestBaseEntity));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    const dataSource = moduleRef.get(getDataSourceToken());
    await dataSource.destroy();
  });

  it('should return all entites without paging and filters', async () => {
    const { items, metadata} = await paginatedQueryService.getData(
      {},
      null
    );

    expect(metadata.total).toEqual(TEST_BASE_ENTITIES_CREATED.length)
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          testEntityPk: expect.any(String),
          stringType: expect.any(String),
          boolType: expect.any(Boolean),
          numberType: expect.any(Number),
          dateType: expect.any(Date)
        }),
      ])
    );
  });

  it('should apply a paging ', async () => {
    const { items, metadata } = await paginatedQueryService.getData(
      {},
      { page: 1, limit: 5 }
    );

    expect(metadata.total).toEqual(TEST_BASE_ENTITIES_CREATED.length)
    expect(items.length).toEqual(5)
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining(exceptedBaseEntity),
      ])
    );
  });

  it('should apply string filter by "stringType"', async () => {
    const { items, metadata } = await paginatedQueryService.getData(
      {
        search:  {
          type: 'equal',
          value: 'test-base-created-1'
        }
      },
      { page: 1, limit: 5 }
    );

    expect(metadata.total).toEqual(1)
    expect(items).toEqual([{
      testEntityPk: TEST_BASE_ENTITIES_CREATED[0].testEntityPk,
      stringType: TEST_BASE_ENTITIES_CREATED[0].stringType,
      boolType: TEST_BASE_ENTITIES_CREATED[0].boolType,
      numberType: TEST_BASE_ENTITIES_CREATED[0].numberType,
      dateType: TEST_BASE_ENTITIES_CREATED[0].dateType
    }]);
  });
});
