import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { dbInitializer, dbRefresh, SeederRegistry } from '@owl-app/testing';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

import { DB_CONFIG_NAME } from '../../../../config/db';
import { AppTypeOrmQueryService } from '../../../../query/typeorm/services/app-typeorm-query.service';
import { InjectQueryServiceRepository } from '../../../../query/common/repository.decorator';
import { TypeOrmModule } from '../../../../typeorm/typeorm.module';
import { BaseRepository } from '../../../../database/repository/base.repository';
import { TestEntity } from '../../../fixtures/test.entity';
import { getDbConfig } from '../../../config/db';
import { getQueryServiceRepositoryToken } from '../../../../query/common/repository.utils';
import TestEntitySeeder from '../../../seeds/test-entity.seed';
import testSeederFactory from '../../../seeds/test-entity.factory';
import { DatabaseModule } from '../../../../database/database.module';
import { TEST_ENTITIES } from '../../../seeds/data/test-entity.data';

describe('AppTypeOrmQueryService', () => {
  class TestEntityService extends AppTypeOrmQueryService<TestEntity> {
    constructor(@InjectQueryServiceRepository(TestEntity) readonly repo: Repository<TestEntity>) {
      super(repo, { useTransaction: true });
    }
  }

  describe('with DB', () => {
    let moduleRef: TestingModule;
    let seederRegistry: SeederRegistry;
    let repository: BaseRepository<TestEntity>;

    beforeAll(async () => {
      await dbInitializer(getDbConfig());
    });

    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          RequestContextModule,
          EventEmitterModule.forRoot({
            ignoreErrors: true,
          }),
          ConfigModule.forRoot({
            isGlobal: true,
            load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
          }),
          DatabaseModule,
          TypeOrmModule.forFeature({
            entities: [
              {
                entity: TestEntity,
                repository: BaseRepository,
                repositoryToken: getQueryServiceRepositoryToken(TestEntity) as string,
                inject: [EventEmitter2]
              },
            ],
          }),
        ],
        providers: [TestEntityService],
      }).compile();

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestEntity));

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

    // describe('createOne', () => {
    //   it(`call save on the repo with an instance of the entity when passed a plain object`, async () => {
    //     const queryService = moduleRef.get(TestEntityService);
    //     const created = await queryService.createOne(TEST_ENTITIES[0]);

    //     expect(created).toEqual(expect.objectContaining(TEST_ENTITIES[0]));
    //   });

    //   it('should reject entity exist', async () => {
    //     const entity = seederRegistry.getResultSeed<TestEntity[]>(TestEntitySeeder.name)[0];
    //     const queryService = moduleRef.get(TestEntityService);

    //     return expect(queryService.createOne(entity)).rejects.toThrow('Entity already exists');
    //   });
    // });

    describe('createOne', () => {
      it(`should true`, async () => {
        const testEntity = plainToClass(TestEntity, TEST_ENTITIES[0]);

        const testEntityAddEventSpy = jest.spyOn(testEntity, 'addEvent');
        const hasIdSpy = jest.spyOn(repository, 'hasId');
        const createSpy = jest.spyOn(repository, 'create');
        const transactionSpy = jest.spyOn(repository, 'transaction');
        const saveSpy = jest.spyOn(repository, 'save');

        hasIdSpy.mockReturnValue(false);
        createSpy.mockReturnValue(testEntity);
        // transactionSpy.mockResolvedValue(testEntity)
        // saveSpy.mockResolvedValue(testEntity)

        const queryService = moduleRef.get(TestEntityService);
        const returnTest = await queryService.createOne(testEntity);

        expect(hasIdSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledTimes(0);
        expect(testEntityAddEventSpy).toHaveBeenCalledTimes(1);
        expect(transactionSpy).toHaveBeenCalledTimes(1);

        const returnEntity = plainToClass(TestEntity, TEST_ENTITIES[0]);

        returnEntity.addEvent({
          eventName: 'TEST_ENTITY_CREATED',
          id: undefined,
        });

        expect(saveSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            ...returnEntity,
            availableDomainEvents: expect.arrayContaining(
              [
                expect.objectContaining({
                  eventName: 'TEST_ENTITY_CREATED',
                }),
              ]
            )
          })
        );
        expect(hasIdSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  // describe('without DB', () => {
  //   let moduleRef: TestingModule;
  //   const mockDataSource = new DataSource(getDbConfig());
  //   let mockEntityManager: EntityManager;
  //   let mockRepository: InjectableRepository<TestEntity>;

  //   beforeEach(async () => {
  //     await mockDataSource.initialize();
  //     mockEntityManager = new EntityManager(mockDataSource);
  //     mockRepository = new InjectableRepository<TestEntity>(TestEntity, mockEntityManager);
  //     moduleRef = await Test.createTestingModule({
  //       imports: [
  //         RequestContextModule,
  //         EventEmitterModule.forRoot({
  //           ignoreErrors: true,
  //         }),
  //       ],
  //       providers: [
  //         TestEntityService,
  //         {
  //           provide: getQueryServiceRepositoryToken(TestEntity),
  //           useValue: mockRepository,
  //         },
  //       ],
  //     }).compile();
  //   });

  //   afterEach(() => jest.clearAllMocks());

  //   describe('createOne', () => {
  //     it(`should true`, async () => {
  //       const testEntity = plainToClass(TestEntity, TEST_ENTITIES[0]);
  //       const hasIdSpy = jest.spyOn(mockRepository, 'hasId');
  //       const createSpy = jest.spyOn(mockRepository, 'create');
  //       // const transactionSpy = jest.spyOn(mockRepository, 'transaction');
  //       const saveSpy = jest.spyOn(mockRepository, 'save');

  //       hasIdSpy.mockReturnValue(false);
  //       createSpy.mockReturnValue(testEntity);
  //       // transactionSpy.mockResolvedValue(testEntity)
  //       // saveSpy.mockResolvedValue(testEntity)

  //       const queryService = moduleRef.get(TestEntityService);
  //       await queryService.createOne(testEntity);

  //       expect(hasIdSpy).toHaveBeenCalledTimes(1);
  //       expect(createSpy).toHaveBeenCalledTimes(1);
  //       // expect(transactionSpy).toHaveBeenCalledTimes(1);
  //       expect(saveSpy).toHaveBeenCalledWith(TEST_ENTITIES[0]);
  //     });
  //   });
  // });
});
