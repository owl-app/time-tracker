import { ObjectLiteral, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { Registry } from '@owl-app/registry';
import { DeepPartial } from '@owl-app/nestjs-query-core';
import { TenantAware } from '@owl-app/lib-contracts';
import { Class } from '@owl-app/types';
import { dbInitializer, dbRefresh, SeederRegistry } from '@owl-app/testing';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

import { DB_CONFIG_NAME } from '../../../../config/db';
import {
  AppTypeOrmQueryService,
  AppTypeOrmQueryServiceOpts,
} from '../../../../query/typeorm/services/app-typeorm-query.service';
import { InjectQueryServiceRepository } from '../../../../query/common/repository.decorator';
import { TypeOrmModule } from '../../../../typeorm/typeorm.module';
import { BaseRepository } from '../../../../database/repository/base.repository';
import { TestSimpleEntity } from '../../../__fixtures__/test-simple.entity';
import { TestDomainEntity } from '../../../__fixtures__/test-domain.entity';
import { getDbConfig } from '../../../config/db';
import { getQueryServiceRepositoryToken } from '../../../../query/common/repository.utils';
import TestEntitySeeder from '../../../seeds/test-entity.seed';
import testSeederFactory from '../../../seeds/test-entity.factory';
import { DatabaseModule } from '../../../../database/database.module';
import { TEST_ENTITIES } from '../../../seeds/data/test-entity.data';
import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../../../../registry/constants';
import { FilterQuery } from '../../../../registry/interfaces/filter-query';
import { TenantRelationFilter } from '../../../../typeorm/filters/tenant-relation.filter';
import { TenantRelationSetter } from '../../../../typeorm/setters/tenant-relation.setter';
import { EntitySetter } from '../../../../registry/interfaces/entity-setter';
import { DynamicModule, ForwardReference, Inject } from '@nestjs/common';

describe('AppTypeOrmQueryService', () => {
  const createTest = (
    entity: Class<unknown>,
    repository: Class<Repository<unknown>>,
    useTransaction = true,
    withEventEmitter = true,
    withFilters = false,
    withSetters = false
  ): [TestingModuleBuilder, Class<any>] => {
    class TestEntityService extends AppTypeOrmQueryService<any> {
      constructor(
        @InjectQueryServiceRepository(entity) readonly repo: Repository<any>,
        @Inject(FILTER_REGISTRY_TENANT) readonly filters: Registry<FilterQuery<ObjectLiteral>>,
        @Inject(SETTER_REGISTRY_TENANT) readonly setters: Registry<EntitySetter<ObjectLiteral>>
      ) {
        super(repo, { useTransaction }, filters, setters);
      }
    }

    const imports: Array<
      Class<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference
    > = [
      RequestContextModule,
      ConfigModule.forRoot({
        isGlobal: true,
        load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
      }),
      DatabaseModule,
    ];
    const inject = [];

    if (withEventEmitter) {
      imports.push(
        EventEmitterModule.forRoot({
          ignoreErrors: true,
        })
      );
      inject.push(EventEmitter2);
    }

    if (withFilters) {
      imports.push(
        RegistryServiceModule.forFeature<FilterQuery<ObjectLiteral>>({
          name: FILTER_REGISTRY_TENANT,
          services: {
            tenant: TenantRelationFilter<TenantAware>,
          },
        })
      );
    }

    if (withSetters) {
      imports.push(
        RegistryServiceModule.forFeature<EntitySetter<ObjectLiteral>>({
          name: SETTER_REGISTRY_TENANT,
          services: {
            tenant: TenantRelationSetter<TenantAware>,
          },
        })
      );
    }

    imports.push(
      TypeOrmModule.forFeature({
        entities: [
          {
            entity,
            repository,
            repositoryToken: getQueryServiceRepositoryToken(entity) as string,
            inject,
          },
        ],
      })
    );

    const moduleRef = Test.createTestingModule({
      imports,
      providers: [TestEntityService],
    });

    return [moduleRef, TestEntityService];
  };

  describe.each<{ name: keyof AppTypeOrmQueryService<TestSimpleEntity>; isUpdated: boolean }>([
    {
      name: 'createOne',
      isUpdated: false,
    },
    {
      name: 'updateOne',
      isUpdated: true,
    },
    {
      name: 'createWithRelations',
      isUpdated: false,
    },
    {
      name: 'updateWithRelations',
      isUpdated: true,
    },

  ])('', (action) => {
    let record: DeepPartial<TestSimpleEntity>;

    describe(`#${action.name}`, () => {
      describe.each<boolean>([true, false])('', (repositoryHasTransaction) => {
        describe(`repository supports transaction: ${repositoryHasTransaction}`, () => {
          describe.each<boolean>([true, false])('', (serviceUseTransactional) => {
            describe(`service useTransactional: ${serviceUseTransactional}`, () => {
              let moduleRef: TestingModule;
              let seederRegistry: SeederRegistry;
              let repository: Repository<TestSimpleEntity>;
              let testingService: Class<any>;

              beforeAll(async () => {
                await dbInitializer(getDbConfig());
              });

              beforeEach(async () => {
                const [testingModule, testService] = await createTest(
                  TestSimpleEntity,
                  repositoryHasTransaction ? BaseRepository : Repository,
                  serviceUseTransactional,
                  true,
                  true,
                  true
                );

                moduleRef = await testingModule.compile();
                testingService = testService;

                repository = moduleRef.get(getQueryServiceRepositoryToken(TestSimpleEntity));

                seederRegistry = await dbRefresh({
                  dataSource: moduleRef.get(getDataSourceToken()),
                  seeds: [TestEntitySeeder],
                  factories: [testSeederFactory],
                });

                record = action.isUpdated
                  ? seederRegistry.getResultSeed<TestSimpleEntity[]>(TestEntitySeeder.name)[0]
                  : TEST_ENTITIES[0];
              });

              afterEach(() => {
                const dataSource = moduleRef.get(getDataSourceToken());
                return dataSource.destroy();
              });

              if (
                (repositoryHasTransaction &&
                  (serviceUseTransactional || !serviceUseTransactional)) ||
                (!repositoryHasTransaction && !serviceUseTransactional)
              ) {
                it(`should save entity`, async () => {
                  const queryService: AppTypeOrmQueryService<TestSimpleEntity> = moduleRef.get(testingService);

                  const saveSpy = jest.spyOn(repository, 'save');

                  if (action.isUpdated) {
                    await (queryService[action.name] as Function)(record.testEntityPk, {
                      stringType: 'updated',
                    });
                  } else {
                    await (queryService[action.name] as Function)(record);
                  }

                  expect(saveSpy).toHaveBeenCalledTimes(1);
                });
              }

              if (!repositoryHasTransaction && serviceUseTransactional) {
                it(`should reject with error`, async () => {
                  expect.assertions(1);
                  let result;

                  const queryService: AppTypeOrmQueryService<TestSimpleEntity> = moduleRef.get(testingService);

                  if (action.isUpdated) {
                    result = (queryService[action.name] as Function)(record.testEntityPk, { stringType: 'updated' });
                  } else {
                    result = (queryService[action.name] as Function)(record);
                  }

                  expect(result).rejects.toThrow('Repository should extend by TransactionalRepository');
                });
              }
            });
          });
        });
      });
    });
  });

  // describe('repository has transaction: ', () => {
  //   describe('#createOne', () => {
  //     describe.each<boolean>([true, false])('#transactional', (transactional) => {
  //       let moduleRef: TestingModule;
  //       let seederRegistry: SeederRegistry;
  //       let repository: Repository<TestSimpleEntity>;
  //       let testingService: Class<any>;

  //       beforeAll(async () => {
  //         await dbInitializer(getDbConfig());
  //       });

  //       beforeEach(async () => {
  //         const [testingModule, testService] = await createTestingModule(
  //           TestSimpleEntity,
  //           Repository,
  //           transactional,
  //           true,
  //           true,
  //           true,
  //         );

  //         moduleRef = await testingModule.compile();
  //         testingService = testService;

  //         repository = moduleRef.get(getQueryServiceRepositoryToken(TestSimpleEntity));

  //         seederRegistry = await dbRefresh({
  //           dataSource: moduleRef.get(getDataSourceToken()),
  //           seeds: [TestEntitySeeder],
  //           factories: [testSeederFactory],
  //         });
  //       });

  //       afterEach(() => {
  //         const dataSource = moduleRef.get(getDataSourceToken());
  //         return dataSource.destroy();
  //       });

  //       it(`should create one entity with transactional: ${transactional}`, async () => {
  //         const queryService = moduleRef.get(testingService);

  //         const saveSpy = jest.spyOn(repository, 'save');

  //         if(!transactional) {
  //           await queryService.createOne(TEST_ENTITIES[0]);

  //           expect(saveSpy).toHaveBeenCalledTimes(transactional ? 0 : 1);
  //         } else {
  //           expect.assertions(1);

  //           expect(queryService.createOne(TEST_ENTITIES[0])).rejects.toThrow('Repository should extend by TransactionalRepository');
  //         }
  //       });
  //     })
  //   });

  // });

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

  //   describe('createOne', () => {
  //     it(`should true`, async () => {
  //       const testEntity = plainToClass(TestEntity, TEST_ENTITIES[0]);

  //       const testEntityAddEventSpy = jest.spyOn(testEntity, 'addEvent');
  //       const hasIdSpy = jest.spyOn(repository, 'hasId');
  //       const createSpy = jest.spyOn(repository, 'create');
  //       const transactionSpy = jest.spyOn(repository, 'transaction');
  //       const saveSpy = jest.spyOn(repository, 'save');

  //       hasIdSpy.mockReturnValue(false);
  //       createSpy.mockReturnValue(testEntity);
  //       // transactionSpy.mockResolvedValue(testEntity)
  //       // saveSpy.mockResolvedValue(testEntity)

  //       const queryService = moduleRef.get(TestEntityService);
  //       const returnTest = await queryService.createOne(testEntity);

  //       expect(hasIdSpy).toHaveBeenCalledTimes(1);
  //       expect(createSpy).toHaveBeenCalledTimes(0);
  //       expect(testEntityAddEventSpy).toHaveBeenCalledTimes(1);
  //       expect(transactionSpy).toHaveBeenCalledTimes(1);

  //       const returnEntity = plainToClass(TestEntity, TEST_ENTITIES[0]);

  //       returnEntity.addEvent({
  //         eventName: 'TEST_ENTITY_CREATED',
  //         id: undefined,
  //       });

  //       expect(saveSpy).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //           ...returnEntity,
  //           availableDomainEvents: expect.arrayContaining(
  //             [
  //               expect.objectContaining({
  //                 eventName: 'TEST_ENTITY_CREATED',
  //               }),
  //             ]
  //           )
  //         })
  //       );
  //       expect(hasIdSpy).toHaveBeenCalledTimes(1);
  //     });
  //   });
  // });

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
