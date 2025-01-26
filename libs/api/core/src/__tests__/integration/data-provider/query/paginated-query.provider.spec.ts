import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { ArchiveOptions } from '@owl-app/lib-contracts';
import { dbRefresh } from '@owl-app/testing';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

import { DB_CONFIG_NAME } from '../../../../config/db';
import { BaseRepository } from '../../../../database/repository/base.repository';
import { TestBaseEntity } from '../../../__fixtures__/test-base.entity';
import { getDbConfig } from '../../../config/db';
import TestEntitySeeder from '../../../seeds/test-entity.seed';
import TenantSeeder from '../../../seeds/tenant.seed';
import { DatabaseModule } from '../../../../database/database.module';
import {
  TEST_BASE_ENTITIES_CREATED,
} from '../../../seeds/data/tes-base-entity.data';
import { AppNestjsQueryTypeOrmModule } from '../../../../query/module';
import { ListFilterBuilder } from '../../../__fixtures__/data-provider/list-filter.builder';
import { getPaginatedQueryServiceToken } from '../../../../data-provider/query/decorators/helpers';
import { FilterBaseEntityDto } from '../../../__fixtures__/dto/filter-base-entity.dto';
import { Paginated } from '../../../../pagination/pagination';
import { DataProvider, SortDirection } from '../../../../data-provider/data.provider';
import { AppAssemblerQueryService } from '../../../../query/core/services/app-assembler-query.service';
import { TestBaseAssembler } from '../../../__fixtures__/assembler/test-base.assembler';
import { PAGINATION_CONFIG_NAME } from '../../../../config';
import {
  FilterStringQuery,
  StringFilter,
} from '../../../../data-provider/query/filters/string';

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

  describe.each<{
    filter: FilterStringQuery;
    count: number;
    equalEntity?: Partial<TestBaseEntity>;
  }>([
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

  describe.each<ArchiveOptions>([ArchiveOptions.ARCHIVED, ArchiveOptions.ACTIVE])(
    'filter with archived filter by field "archived"',
    (archivedFilter) => {
      it(`should apply filter #${archivedFilter}`, async () => {
        const { items } = await paginatedQueryService.getData({
          archived: archivedFilter,
        });

        const expectedCount = TEST_BASE_ENTITIES_CREATED.filter((item) =>
          archivedFilter === ArchiveOptions.ARCHIVED ? item.archived : !item.archived
        ).length;

        expect(items.length).toEqual(expectedCount);
      });
    }
  );

  it('should reject if string filter not supported', async () => {
    const filter = { type: 'not_supported', value: 'test' };

    expect(
      paginatedQueryService.getData({
        search: filter,
      })
    ).rejects.toThrow(`Filter ${filter.type} not supported`);
  });
});
