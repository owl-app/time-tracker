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
import { DataProvider, SortDirection } from '../../../../data-provider/data.provider';
import { AppAssemblerQueryService } from '../../../../query/core/services/app-assembler-query.service';
import { TestBaseAssembler } from '../../../__fixtures__/assembler/test-base.assembler';
import config, { PAGINATION_CONFIG_NAME } from '../../../../config';
import { StringFilter } from '../../../../data-provider/query/filters/string';

describe('PaginatedQueryProvider', () => {
  let moduleRef: TestingModule;
  let paginatedQueryService: DataProvider<
    Paginated<TestBaseEntity>,
    FilterBaseEntityDto,
    TestBaseEntity
  >;
  const exceptedBaseEntity = {
    testEntityPk: expect.any(String),
    stringType: expect.any(String),
    boolType: expect.any(Boolean),
    numberType: expect.any(Number),
    dateType: expect.any(Date),
    tenant: expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
    }),
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
            })),
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
    const { items, metadata } = await paginatedQueryService.getData({}, null);

    expect(metadata.total).toEqual(TEST_BASE_ENTITIES_CREATED.length);
    expect(items).toEqual(expect.arrayContaining([expect.objectContaining(exceptedBaseEntity)]));
  });

  it('should apply a paging ', async () => {
    const { items, metadata } = await paginatedQueryService.getData({}, { page: 1, limit: 5 });

    expect(metadata.total).toEqual(TEST_BASE_ENTITIES_CREATED.length);
    expect(items.length).toEqual(5);
    expect(items).toEqual(expect.arrayContaining([expect.objectContaining(exceptedBaseEntity)]));
  });

  describe.each([
    {
      filter: { type: StringFilter.TYPE_EQUAL, value: 'test-base-created-1' },
      count: 1,
      equalEntity: TEST_BASE_ENTITIES_CREATED[0],
    },
    {
      filter: { type: StringFilter.TYPE_NOT_EQUAL, value: 'test-base-created-1' },
      count: 9,
    },
    {
      filter: { type: StringFilter.TYPE_EMPTY },
      count: 0,
    },
    {
      filter: { type: StringFilter.TYPE_NOT_EMPTY },
      count: 10,
    },
    {
      filter: { type: StringFilter.TYPE_CONTAINS, value: 'test' },
      count: 10,
    },
    {
      filter: { type: StringFilter.TYPE_NOT_CONTAINS, value: 'test-base-created-1' },
      count: 8,
    },
    {
      filter: { type: StringFilter.TYPE_STARTS_WITH, value: 'test-base-created-1' },
      count: 2,
    },
    {
      filter: { type: StringFilter.TYPE_ENDS_WITH, value: '10' },
      count: 1,
      equalEntity: TEST_BASE_ENTITIES_CREATED[9],
    },
    {
      filter: { type: StringFilter.TYPE_IN, value: 'test-base-created-1,test-base-created-2' },
      count: 2,
    },
    {
      filter: { type: StringFilter.TYPE_NOT_IN, value: 'test-base-created-1,test-base-created-2' },
      count: 8,
    },
  ])('filter with string filter by field "stringType"', (item) => {
    it(`should apply string filter #${item.filter.type}`, async () => {
      const { items, metadata } = await paginatedQueryService.getData({
        search: item.filter,
      });

      expect(metadata.total).toEqual(item.count);

      if (item.equalEntity) {
        expect(items).toEqual([
          {
            testEntityPk: item.equalEntity.testEntityPk,
            stringType: item.equalEntity.stringType,
            boolType: item.equalEntity.boolType,
            numberType: item.equalEntity.numberType,
            dateType: item.equalEntity.dateType,
            tenant: item.equalEntity.tenant,
          },
        ]);
      }
    });
  });

  it('should apply a sorting ', async () => {
    const { items, metadata } = await paginatedQueryService.getData({}, null, {
      field: 'numberType',
      direction: SortDirection.DESC,
    });

    const highestNumberType = TEST_BASE_ENTITIES_CREATED.reduce(
      (maxObj, item) => (item.numberType > maxObj.numberType ? item : maxObj),
    { numberType: -Infinity }
    );

    expect(metadata.total).toEqual(TEST_BASE_ENTITIES_CREATED.length);
    expect(items[0]).toEqual({
      testEntityPk: highestNumberType.testEntityPk,
      stringType: highestNumberType.stringType,
      boolType: highestNumberType.boolType,
      numberType: highestNumberType.numberType,
      dateType: highestNumberType.dateType,
      tenant: highestNumberType.tenant,
    });
  });

  it('should reject if string filter not supported', async () => {
    const filter = { type: 'not_supported', value: 'test' };

    expect(
      paginatedQueryService.getData({
        search: filter,
      })
    ).rejects.toThrow(`Filter ${filter.type} not supported`);
  });
});
