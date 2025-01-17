import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { dbInitializer, dbRefresh, SeederRegistry } from '@owl-app/testing';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

import { DB_CONFIG_NAME } from '../../../../config/db';
import { AppTypeOrmQueryService } from '../../../../query/typeorm/services/app-typeorm-query.service';
import { InjectQueryServiceRepository } from '../../../../query/common/repository.decorator';
import { TypeOrmModule } from '../../../../typeorm/typeorm.module';
import { InjectableRepository } from '../../../../database/repository/injectable.repository';
import { TestEntity } from '../../../fixtures/test.entity';
import { getDbConfig } from '../../../config/db';
import { getQueryServiceRepositoryToken } from '../../../../query/common/repository.utils';
import TestEntitySeeder from '../../../seeds/test-entity.seed';
import testSeederFactory from '../../../seeds/test-entity.factory';
import { DatabaseModule } from '../../../../database/database.module';


describe('AppTypeOrmQueryService', () => {
  let moduleRef: TestingModule;
  let seederRegistry: SeederRegistry;

  class TestEntityService extends AppTypeOrmQueryService<TestEntity> {
    constructor(@InjectQueryServiceRepository(TestEntity) readonly repo: Repository<TestEntity>) {
      super(repo, { useTransaction: true });
    }
  }

  beforeAll(async () => {
    await dbInitializer(getDbConfig());
  })

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        RequestContextModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
        }),
        DatabaseModule,
        TypeOrmModule.forFeature({
          entities: [
            {
              entity: TestEntity,
              repository: InjectableRepository,
              repositoryToken: getQueryServiceRepositoryToken(TestEntity) as string,
            },
          ],
        }),
      ],
      providers: [TestEntityService],
    }).compile();

    seederRegistry = await dbRefresh({
      dataSource: moduleRef.get(getDataSourceToken()),
      seeds: [TestEntitySeeder],
      factories: [testSeederFactory],
    });
  });

  afterEach(() => {
    const dataSource = moduleRef.get(getDataSourceToken());
    return dataSource.destroy();
  });

  describe('createOne', () => {
    it(`should true`, async () => {
      const queryService = moduleRef.get(TestEntityService);
      const toCreate = {
        testEntityPk: faker.string.uuid(),
        stringType: faker.lorem.words(3),
        boolType: faker.datatype.boolean(),
        numberType: faker.number.int(),
        dateType: faker.date.anytime(),
      };

      const created = await queryService.createOne(toCreate);

      expect(created).toEqual(expect.objectContaining(toCreate));
    });
  });
});
