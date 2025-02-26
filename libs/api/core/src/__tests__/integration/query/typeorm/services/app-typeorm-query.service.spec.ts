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

import { RequestContextService } from '../../../../../context/app-request-context';
import { DB_CONFIG_NAME } from '../../../../../config/db';
import { AppTypeOrmQueryService } from '../../../../../query/typeorm/services/app-typeorm-query.service';
import { InjectQueryServiceRepository } from '../../../../../query/common/repository.decorator';
import { TypeOrmModule } from '../../../../../typeorm/typeorm.module';
import { BaseRepository } from '../../../../../database/repository/base.repository';
import { TestSimpleEntity } from '../../../../__fixtures__/test-simple.entity';
import { TestBaseEntity } from '../../../../__fixtures__/test-base.entity';
import { getDbConfig } from '../../../../config/db';
import { getQueryServiceRepositoryToken } from '../../../../../query/common/repository.utils';
import TestEntitySeeder from '../../../../seeds/test-entity.seed';
import TenantSeeder from '../../../../seeds/tenant.seed';
import { DatabaseModule } from '../../../../../database/database.module';
import {
  TEST_BASE_ENTITIES_CREATED,
  TEST_BASE_ENTITIES_NEW,
  TEST_SIMPLE_ENTITIES_CREATED,
  TEST_SIMPLE_ENTITIES_NEW,
} from '../../../../seeds/data/tes-base-entity.data';
import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../../../../../registry/constants';
import { FilterQuery } from '../../../../../registry/interfaces/filter-query';
import { TenantRelationFilter } from '../../../../../typeorm/filters/tenant-relation.filter';
import { TenantRelationSetter } from '../../../../../typeorm/setters/tenant-relation.setter';
import { EntitySetter } from '../../../../../registry/interfaces/entity-setter';
import { authUserData, createAuthUserData } from '../../../../__fixtures__/auth-user.data';
import { TEST_TENANT_CREATED } from '../../../../seeds/data/tenant.data';
import { TEST_BASE_RELATION_CREATED } from '../../../../seeds/data/test-base-relation.data';

async function runMethodInstanceObject<
  T,
  K extends {
    [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never;
  }[keyof T]
>(
  instance: T,
  methodName: K,
  ...args: T[K] extends (...args: infer A) => any ? A : never
): Promise<T[K] extends (...args: any[]) => infer R ? R : never> {
  if (typeof instance[methodName] === 'function') {
    const result = await instance[methodName](...args);

    return result;
  }

  throw new Error(`${String(methodName)} is not a function`);
}

describe('AppTypeOrmQueryService', () => {
  const createTest = async <Entity extends EntityClassOrSchema>(
    entity: Entity,
    repository: Class<Repository<any>>,
    useTransaction = true,
    withEventEmitter = true
  ): Promise<[TestingModule, Class<AppTypeOrmQueryService<any>>]> => {
    class TestEntityService extends AppTypeOrmQueryService<any> {
      constructor(
        @InjectQueryServiceRepository(entity) readonly repo: Repository<Entity>,
        @Inject(FILTER_REGISTRY_TENANT) readonly filters: Registry<FilterQuery<ObjectLiteral>>,
        @Inject(SETTER_REGISTRY_TENANT) readonly setters: Registry<EntitySetter<ObjectLiteral>>
      ) {
        super(repo, { useTransaction }, filters, setters);
      }
    }

    const imports = [];
    const inject = [];

    if (withEventEmitter) {
      imports.push(
        EventEmitterModule.forRoot({
          ignoreErrors: true,
        })
      );
      inject.push(EventEmitter2);
    }

    const moduleRef = await Test.createTestingModule({
      imports: [
        ...imports,
        ...[
          RequestContextModule,
          ConfigModule.forRoot({
            isGlobal: true,
            load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
          }),
          DatabaseModule,
          TypeOrmModule.forFeature({
            entities: [
              {
                entity,
                repository,
                repositoryToken: getQueryServiceRepositoryToken(entity) as string,
                inject,
              },
            ],
          }),
          RegistryServiceModule.forFeature<FilterQuery<ObjectLiteral>>({
            name: FILTER_REGISTRY_TENANT,
            services: {
              tenant: TenantRelationFilter<TenantAware>,
            },
          }),
          RegistryServiceModule.forFeature<EntitySetter<ObjectLiteral>>({
            name: SETTER_REGISTRY_TENANT,
            services: {
              tenant: TenantRelationSetter<TenantAware>,
            },
          }),
        ],
      ],
      providers: [TestEntityService],
    }).compile();

    return [moduleRef, TestEntityService];
  };

  function transactionSupport<
    K extends {
      [P in keyof AppTypeOrmQueryService<any>]: AppTypeOrmQueryService<any>[P] extends (
        ...args: any[]
      ) => any
        ? P
        : never;
    }[keyof AppTypeOrmQueryService<any>]
  >(
    methodName: K,
    ...args: AppTypeOrmQueryService<any>[K] extends (...args: infer A) => any ? A : never
  ): void {
    describe('Transaction support', () => {
      describe.each<boolean>([true, false])('', (repositoryHasTransaction) => {
        describe(`repository supports transaction: ${repositoryHasTransaction}`, () => {
          describe.each<boolean>([true, false])('', (serviceUseTransactional) => {
            describe(`service useTransactional: ${serviceUseTransactional}`, () => {
              let moduleRef: TestingModule;
              let repository: Repository<TestSimpleEntity>;
              let queryService: AppTypeOrmQueryService<TestSimpleEntity>;
              let saveSpy: jest.SpyInstance<
                Promise<DeepPartial<TestSimpleEntity> & TestSimpleEntity>
              >;
              let transactionSpy: jest.SpyInstance<
                Promise<unknown>,
                [handler: () => Promise<unknown>],
                any
              >;
              const messageReject = 'Repository should extend by TransactionalRepository';

              beforeAll(async () => {
                await dbInitializer(getDbConfig());
              });

              beforeEach(async () => {
                const [testingModule, testingService] = await createTest(
                  TestSimpleEntity,
                  repositoryHasTransaction ? BaseRepository : Repository,
                  serviceUseTransactional,
                  repositoryHasTransaction
                );

                moduleRef = testingModule;

                repository = moduleRef.get(getQueryServiceRepositoryToken(TestSimpleEntity));

                await dbRefresh({
                  dataSource: moduleRef.get(getDataSourceToken()),
                  seeds: [TenantSeeder, TestEntitySeeder],
                });

                queryService = moduleRef.get(testingService);

                saveSpy = jest.spyOn(repository, 'save');

                if (repository instanceof BaseRepository) {
                  transactionSpy = jest.spyOn(repository, 'transaction');
                }
              });

              afterEach(async () => {
                const dataSource = moduleRef.get(getDataSourceToken());
                await dataSource.destroy();
              });

              if (
                (repositoryHasTransaction &&
                  (serviceUseTransactional || !serviceUseTransactional)) ||
                (!repositoryHasTransaction && !serviceUseTransactional)
              ) {
                it(`should save entity`, async () => {
                  const spyCreateEvent = jest.spyOn(queryService as any, 'createEvent');

                  const setterRegistry = moduleRef.get(SETTER_REGISTRY_TENANT);
                  const allServicesSetters = setterRegistry.all();
                  jest.spyOn(setterRegistry, 'all').mockReturnValue(allServicesSetters);
                  const spyTenantSetterExecute = jest.spyOn(allServicesSetters.tenant, 'execute');

                  await runMethodInstanceObject(queryService, methodName, ...args);

                  expect(spyTenantSetterExecute).toHaveBeenCalledTimes(0);
                  expect(spyCreateEvent).toHaveBeenCalledTimes(0);
                  expect(saveSpy).toHaveBeenCalledTimes(1);

                  if (repositoryHasTransaction && serviceUseTransactional) {
                    expect(transactionSpy).toHaveBeenCalledTimes(1);
                  }
                });
              }

              if (!repositoryHasTransaction && serviceUseTransactional) {
                it(`should reject with error`, () => {
                  expect(
                    runMethodInstanceObject(queryService, methodName, ...args)
                  ).rejects.toThrow(messageReject);
                });
              }
            });
          });
        });
      });
    });
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#createOne', () => {
    transactionSupport('createOne', TEST_SIMPLE_ENTITIES_NEW[0]);
  });

  describe('#createOne', () => {
    let moduleRef: TestingModule;
    let repository: Repository<TestSimpleEntity>;
    let queryService: AppTypeOrmQueryService<TestBaseEntity>;

    beforeAll(async () => {
      await dbInitializer(getDbConfig());
    });

    beforeEach(async () => {
      const [testingModule, testingService] = await createTest(
        TestBaseEntity,
        BaseRepository,
        true,
        true
      );

      moduleRef = testingModule;

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestBaseEntity));

      await dbRefresh({
        dataSource: moduleRef.get(getDataSourceToken()),
        seeds: [TenantSeeder, TestEntitySeeder],
      });

      queryService = moduleRef.get(testingService);
    });

    afterEach(async () => {
      const dataSource = moduleRef.get(getDataSourceToken());
      await dataSource.destroy();
    });

    it(`should save entity with domain event "TEST_BASE_ENTITY_CREATED" and registry setters`, async () => {
      const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
      const spyEmitAsync = jest.spyOn(moduleRef.get(EventEmitter2), 'emitAsync');

      const setterRegistry = moduleRef.get(SETTER_REGISTRY_TENANT);
      const allServicesSetters = setterRegistry.all();
      jest.spyOn(setterRegistry, 'all').mockReturnValue(allServicesSetters);
      const spyTenantSetterExecute = jest.spyOn(allServicesSetters.tenant, 'execute');

      const saveSpy = jest.spyOn(repository, 'save');

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(authUserData);

      const created = await queryService.createOne(entity);

      expect(spyTenantSetterExecute).toHaveBeenCalledTimes(1);
      expect(spyEmitAsync).toHaveBeenCalledWith(
        'TEST_BASE_ENTITY_CREATED',
        expect.objectContaining(entity)
      );
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(created).toEqual(
        expect.objectContaining({
          ...entity,
          tenant: authUserData.tenant,
        })
      );
    });

    it('should reject if the entity exist', async () => {
      const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_CREATED[0]);

      return expect(queryService.createOne(entity)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#updateOne', () => {
    transactionSupport('updateOne', TEST_SIMPLE_ENTITIES_CREATED[0].testEntityPk, {
      stringType: 'updated',
    });
  });

  describe('#updateOne', () => {
    let moduleRef: TestingModule;
    let repository: Repository<TestSimpleEntity>;
    let queryService: AppTypeOrmQueryService<TestBaseEntity>;
    let setterRegistry: Registry<EntitySetter<ObjectLiteral>>;
    let saveSpy: jest.SpyInstance<Promise<DeepPartial<TestSimpleEntity> & TestSimpleEntity>>;

    beforeAll(async () => {
      await dbInitializer(getDbConfig());
    });

    beforeEach(async () => {
      const [testingModule, testingService] = await createTest(
        TestBaseEntity,
        BaseRepository,
        true,
        true
      );

      moduleRef = testingModule;

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestBaseEntity));

      await dbRefresh({
        dataSource: moduleRef.get(getDataSourceToken()),
        seeds: [TenantSeeder, TestEntitySeeder],
      });

      queryService = moduleRef.get(testingService);
      setterRegistry = moduleRef.get(SETTER_REGISTRY_TENANT);

      saveSpy = jest.spyOn(repository, 'save');
    });

    afterEach(async () => {
      const dataSource = moduleRef.get(getDataSourceToken());
      await dataSource.destroy();
    });

    it(`should update entity with domain event "TEST_BASE_ENTITY_UPDATED" and registry setters`, async () => {
      const entity = omit(TEST_BASE_ENTITIES_CREATED[0], 'testBaseRelations');
      const toSave = plainToClass(TestBaseEntity, { stringType: 'updated' });
      const spyEmitAsync = jest.spyOn(moduleRef.get(EventEmitter2), 'emitAsync');
      const userData = authUserData;
      userData.tenant = entity.tenant;

      const allServicesSetters = setterRegistry.all();
      jest.spyOn(setterRegistry, 'all').mockReturnValue(allServicesSetters);

      const spyTenantSetterExecute = jest.spyOn(allServicesSetters.tenant, 'execute');

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(authUserData);

      const updated = await queryService.updateOne(entity.testEntityPk, toSave);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(spyEmitAsync).toHaveBeenCalledWith(
        'TEST_BASE_ENTITY_UPDATED',
        expect.objectContaining({ ...entity, ...toSave })
      );
      expect(spyTenantSetterExecute).toHaveBeenCalledTimes(1);
      expect(updated).toEqual(
        expect.objectContaining({
          ...entity,
          stringType: 'updated',
          tenant: authUserData.tenant,
        })
      );
    });

    it('should reject if id is specified in the sent data', async () => {
      const entity = TEST_BASE_ENTITIES_CREATED[0];

      return expect(queryService.updateOne(entity.id, entity)).rejects.toThrow(
        'Id cannot be specified when updating'
      );
    });

    it('should reject if the entity does not exist', async () => {
      const entity = omit(TEST_BASE_ENTITIES_NEW[0], ['testEntityPk']);
      const id = 'test-id';

      return expect(queryService.updateOne('test-id', entity)).rejects.toThrow(
        `Unable to find TestBaseEntity with id: ${id}`
      );
    });

    it('should reject if the entity does not exist with another tenant', async () => {
      const userData = authUserData;
      const entity = TEST_BASE_ENTITIES_CREATED[0];

      userData.tenant = {
        id: 'another-tenant-id',
        name: 'another-tenant',
      };

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      return expect(
        queryService.updateOne(
          entity.testEntityPk,
          omit(TEST_BASE_ENTITIES_CREATED[0], ['testEntityPk'])
        )
      ).rejects.toThrow(`Unable to find TestBaseEntity with id: ${entity.testEntityPk}`);
    });
  });

  describe('#createWithRelations', () => {
    transactionSupport('createWithRelations', TEST_SIMPLE_ENTITIES_NEW[0]);
  });

  describe('#createWithRelations', () => {
    let moduleRef: TestingModule;
    let repository: Repository<TestSimpleEntity>;
    let queryService: AppTypeOrmQueryService<TestBaseEntity>;

    beforeAll(async () => {
      await dbInitializer(getDbConfig());
    });

    beforeEach(async () => {
      const [testingModule, testingService] = await createTest(
        TestBaseEntity,
        BaseRepository,
        true,
        true
      );

      moduleRef = testingModule;

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestBaseEntity));

      await dbRefresh({
        dataSource: moduleRef.get(getDataSourceToken()),
        seeds: [TenantSeeder, TestEntitySeeder],
      });

      queryService = moduleRef.get(testingService);
    });

    afterEach(async () => {
      const dataSource = moduleRef.get(getDataSourceToken());
      await dataSource.destroy();
      await moduleRef.close();
    });

    it(`should save entity without relations with domain event "TEST_BASE_ENTITY_CREATED" and registry setters`, async () => {
      const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
      const spyEmitAsync = jest.spyOn(moduleRef.get(EventEmitter2), 'emitAsync');
      const userData = createAuthUserData(TEST_TENANT_CREATED[0]);

      const setterRegistry = moduleRef.get(SETTER_REGISTRY_TENANT);
      const allServicesSetters = setterRegistry.all();
      jest.spyOn(setterRegistry, 'all').mockReturnValue(allServicesSetters);
      const spyTenantSetterExecute = jest.spyOn(allServicesSetters.tenant, 'execute');

      const saveSpy = jest.spyOn(repository, 'save');

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      const created = await queryService.createWithRelations(entity, {
        stringType: { eq: 'unique-name' },
      });

      expect(spyTenantSetterExecute).toHaveBeenCalledTimes(1);
      expect(spyEmitAsync).toHaveBeenCalledWith(
        'TEST_BASE_ENTITY_CREATED',
        expect.objectContaining(entity)
      );
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(created).toEqual(
        expect.objectContaining({
          ...entity,
          tenant: userData.tenant,
        })
      );
    });

    describe('with relations', () => {
      const createErrorMessage = (relation: string) =>
        `Unable to find all ${relation} to add to TestBaseEntity`;
      const userData = createAuthUserData(TEST_TENANT_CREATED[0]);

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      describe('#OneToOne', () => {
        it(`should save with the same tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          [entity.oneTestBaseRelation] = [TEST_BASE_RELATION_CREATED[0]];

          const created = await queryService.createWithRelations(entity);

          expect(created).toEqual(
            expect.objectContaining({
              ...entity,
              tenant: userData.tenant,
              oneTestBaseRelation: expect.objectContaining({
                testBaseRelationPk: entity.oneTestBaseRelation.testBaseRelationPk,
              }),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          [entity.oneTestBaseRelation] = [TEST_BASE_RELATION_CREATED[2]];

          return expect(queryService.createWithRelations(entity)).rejects.toThrow(
            createErrorMessage('oneTestBaseRelation')
          );
        });
      });

      describe('#OneToMany', () => {
        it(`should save with the same tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.testBaseRelations = [TEST_BASE_RELATION_CREATED[0]];

          const created = await queryService.createWithRelations(entity);

          expect(created).toEqual(
            expect.objectContaining({
              ...entity,
              tenant: userData.tenant,
              testBaseRelations: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: entity.testBaseRelations[0].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.testBaseRelations = [TEST_BASE_RELATION_CREATED[0], TEST_BASE_RELATION_CREATED[2]];

          return expect(queryService.createWithRelations(entity)).rejects.toThrow(
            createErrorMessage('testBaseRelations')
          );
        });
      });
      describe('#ManyToOne', () => {
        it(`should save with the same tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          [entity.manyToOneBaseRelation] = [TEST_BASE_RELATION_CREATED[0]];

          const created = await queryService.createWithRelations(entity);

          expect(created).toEqual(
            expect.objectContaining({
              ...entity,
              tenant: userData.tenant,
              manyToOneBaseRelation: expect.objectContaining({
                testBaseRelationPk: entity.manyToOneBaseRelation.testBaseRelationPk,
              }),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          [entity.manyToOneBaseRelation] = [TEST_BASE_RELATION_CREATED[2]];

          return expect(queryService.createWithRelations(entity)).rejects.toThrow(
            createErrorMessage('manyToOneBaseRelation')
          );
        });
      });

      describe('#ManyToMany', () => {
        it(`should save with the same tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.manyTestBaseRelations = [TEST_BASE_RELATION_CREATED[0]];

          const created = await queryService.createWithRelations(entity);

          expect(created).toEqual(
            expect.objectContaining({
              ...entity,
              tenant: userData.tenant,
              manyTestBaseRelations: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: entity.manyTestBaseRelations[0].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.manyTestBaseRelations = [
            TEST_BASE_RELATION_CREATED[0],
            TEST_BASE_RELATION_CREATED[2],
          ];

          return expect(queryService.createWithRelations(entity)).rejects.toThrow(
            createErrorMessage('manyTestBaseRelations')
          );
        });
      });

      describe('#ManyToMany UniDirectional', () => {
        it(`should save with the same tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.manyToManyUniDirectional = [TEST_BASE_RELATION_CREATED[0]];

          const created = await queryService.createWithRelations(entity);

          expect(created).toEqual(
            expect.objectContaining({
              ...entity,
              tenant: userData.tenant,
              manyToManyUniDirectional: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: entity.manyToManyUniDirectional[0].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_NEW[0]);
          entity.manyToManyUniDirectional = [
            TEST_BASE_RELATION_CREATED[0],
            TEST_BASE_RELATION_CREATED[2],
          ];

          return expect(queryService.createWithRelations(entity)).rejects.toThrow(
            createErrorMessage('manyToManyUniDirectional')
          );
        });
      });
    });

    it('should reject if the entity exist', async () => {
      const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_CREATED[0]);

      return expect(queryService.createWithRelations(entity)).rejects.toThrow(
        'Entity already exists'
      );
    });

    it('should reject if the entity exist by filter', async () => {
      const entity = plainToClass(TestBaseEntity, TEST_BASE_ENTITIES_CREATED[0]);

      return expect(
        queryService.createWithRelations(entity, {
          testEntityPk: { eq: TEST_BASE_ENTITIES_CREATED[0].testEntityPk },
        })
      ).rejects.toThrow('Entity already exists');
    });
  });

  describe('#updateWithRelations', () => {
    transactionSupport('updateWithRelations', TEST_SIMPLE_ENTITIES_CREATED[0].testEntityPk, {
      stringType: 'updated',
    });
  });

  describe('#updateWithRelations', () => {
    let moduleRef: TestingModule;
    let repository: Repository<TestSimpleEntity>;
    let queryService: AppTypeOrmQueryService<TestBaseEntity>;

    beforeAll(async () => {
      await dbInitializer(getDbConfig());
    });

    beforeEach(async () => {
      const [testingModule, testingService] = await createTest(
        TestBaseEntity,
        BaseRepository,
        true,
        true
      );

      moduleRef = testingModule;

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestBaseEntity));

      await dbRefresh({
        dataSource: moduleRef.get(getDataSourceToken()),
        seeds: [TenantSeeder, TestEntitySeeder],
      });

      queryService = moduleRef.get(testingService);
    });

    afterEach(async () => {
      const dataSource = moduleRef.get(getDataSourceToken());
      await dataSource.destroy();
      await moduleRef.close();
    });

    it(`should update entity without relations with domain event "TEST_BASE_ENTITY_CREATED" and registry setters`, async () => {
      const entity = omit(TEST_BASE_ENTITIES_CREATED[0], 'testBaseRelations');
      const toSave = plainToClass(TestBaseEntity, { stringType: 'updated' });
      const spyEmitAsync = jest.spyOn(moduleRef.get(EventEmitter2), 'emitAsync');
      const userData = createAuthUserData(entity.tenant);

      const setterRegistry = moduleRef.get(SETTER_REGISTRY_TENANT);
      const allServicesSetters = setterRegistry.all();
      jest.spyOn(setterRegistry, 'all').mockReturnValue(allServicesSetters);
      const spyTenantSetterExecute = jest.spyOn(allServicesSetters.tenant, 'execute');

      const saveSpy = jest.spyOn(repository, 'save');

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      const updated = await queryService.updateWithRelations(
        { testEntityPk: { eq: entity.testEntityPk } },
        toSave
      );

      expect(spyTenantSetterExecute).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(spyEmitAsync).toHaveBeenCalledWith(
        'TEST_BASE_ENTITY_UPDATED',
        expect.objectContaining({ ...entity, ...toSave })
      );
      expect(spyTenantSetterExecute).toHaveBeenCalledTimes(1);
      expect(updated).toEqual(
        expect.objectContaining({
          ...entity,
          stringType: 'updated',
          tenant: userData.tenant,
        })
      );
    });

    it('should reject if id is specified in the sent data', async () => {
      const entity = TEST_BASE_ENTITIES_CREATED[0];

      return expect(queryService.updateWithRelations(entity.id, entity)).rejects.toThrow(
        'Id cannot be specified when updating'
      );
    });

    it('should reject if the entity does not exist', async () => {
      const entity = omit(TEST_BASE_ENTITIES_NEW[0], ['testEntityPk']);
      const id = 'test-id';

      return expect(queryService.updateWithRelations('test-id', entity)).rejects.toThrow(
        `Unable to find TestBaseEntity with id: ${id}`
      );
    });

    it('should reject if the entity does not exist by filter', async () => {
      const entity = omit(TEST_BASE_ENTITIES_NEW[0], ['testEntityPk']);
      const filter = { testEntityPk: { eq: 'test-id' } };

      return expect(queryService.updateWithRelations(filter, entity)).rejects.toThrow(
        `Entity not found`
      );
    });

    it('should reject if multiple entities find by filter', async () => {
      const userData = createAuthUserData({ id: 'another-tenant-id', name: 'another-tenant' }, [
        'ROLE_ADMIN_SYSTEM',
      ]);
      const entity = omit(TEST_BASE_ENTITIES_NEW[0], ['testEntityPk']);
      const filter = { stringType: { like: 'test%' } };

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      return expect(queryService.updateWithRelations(filter, entity)).rejects.toThrow(
        `Multiple entities found`
      );
    });

    it('should reject if the entity does not exist with another tenant', async () => {
      const userData = createAuthUserData({ id: 'another-tenant-id', name: 'another-tenant' });
      const entity = TEST_BASE_ENTITIES_CREATED[0];

      jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);

      return expect(
        queryService.updateWithRelations(
          entity.testEntityPk,
          omit(TEST_BASE_ENTITIES_CREATED[0], ['testEntityPk'])
        )
      ).rejects.toThrow(`Unable to find TestBaseEntity with id: ${entity.testEntityPk}`);
    });

    describe('with relations', () => {
      const createErrorMessage = (relation: string) =>
        `Unable to find all ${relation} to add to TestBaseEntity`;
      const userData = createAuthUserData(TEST_TENANT_CREATED[0]);
      const entity = TEST_BASE_ENTITIES_CREATED[0];

      beforeEach(() => {
        jest.spyOn(RequestContextService, 'getCurrentUser').mockReturnValue(userData);
      });

      describe('#OneToOne', () => {
        it(`should save with the same tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            stringType: 'updated',
            oneTestBaseRelation: TEST_BASE_RELATION_CREATED[0],
          });

          const updated = await queryService.updateWithRelations(entity.testEntityPk, toSave);

          expect(updated).toEqual(
            expect.objectContaining({
              stringType: 'updated',
              tenant: userData.tenant,
              oneTestBaseRelation: expect.objectContaining({
                testBaseRelationPk: toSave.oneTestBaseRelation.testBaseRelationPk,
              }),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            oneTestBaseRelation: TEST_BASE_RELATION_CREATED[2],
          });

          return expect(
            queryService.updateWithRelations(entity.testEntityPk, toSave)
          ).rejects.toThrow(createErrorMessage('oneTestBaseRelation'));
        });
      });

      describe('#OneToMany', () => {
        it(`should save with the same tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            stringType: 'updated',
            testBaseRelations: [TEST_BASE_RELATION_CREATED[0], entity.testBaseRelations[0]],
          });

          const updated = await queryService.updateWithRelations(entity.testEntityPk, toSave);

          expect(updated).toEqual(
            expect.objectContaining({
              stringType: 'updated',
              tenant: userData.tenant,
              testBaseRelations: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: toSave.testBaseRelations[0].testBaseRelationPk,
                }),
                expect.objectContaining({
                  testBaseRelationPk: toSave.testBaseRelations[1].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            testBaseRelations: [TEST_BASE_RELATION_CREATED[0], TEST_BASE_RELATION_CREATED[2]],
          });

          return expect(
            queryService.updateWithRelations(entity.testEntityPk, toSave)
          ).rejects.toThrow(createErrorMessage('testBaseRelations'));
        });
      });

      describe('#ManyToOne', () => {
        it(`should save with the same tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            stringType: 'updated',
            manyToOneBaseRelation: TEST_BASE_RELATION_CREATED[0],
          });

          const updated = await queryService.updateWithRelations(entity.testEntityPk, toSave);

          expect(updated).toEqual(
            expect.objectContaining({
              stringType: 'updated',
              tenant: userData.tenant,
              manyToOneBaseRelation: expect.objectContaining({
                testBaseRelationPk: toSave.manyToOneBaseRelation.testBaseRelationPk,
              }),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            manyToOneBaseRelation: TEST_BASE_RELATION_CREATED[2],
          });

          return expect(
            queryService.updateWithRelations(entity.testEntityPk, toSave)
          ).rejects.toThrow(createErrorMessage('manyToOneBaseRelation'));
        });
      });

      describe('#ManyToMany', () => {
        it(`should save with the same tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            stringType: 'updated',
            manyTestBaseRelations: [TEST_BASE_RELATION_CREATED[0]],
          });

          const updated = await queryService.updateWithRelations(entity.testEntityPk, toSave);

          expect(updated).toEqual(
            expect.objectContaining({
              stringType: 'updated',
              tenant: userData.tenant,
              manyTestBaseRelations: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: toSave.manyTestBaseRelations[0].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            manyTestBaseRelations: [TEST_BASE_RELATION_CREATED[0], TEST_BASE_RELATION_CREATED[2]],
          });

          return expect(
            queryService.updateWithRelations(entity.testEntityPk, toSave)
          ).rejects.toThrow(createErrorMessage('manyTestBaseRelations'));
        });
      });

      describe('#ManyToMany UniDirectional', () => {
        it(`should save with the same tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            stringType: 'updated',
            manyToManyUniDirectional: [TEST_BASE_RELATION_CREATED[0]],
          });

          const updated = await queryService.updateWithRelations(entity.testEntityPk, toSave);

          expect(updated).toEqual(
            expect.objectContaining({
              stringType: 'updated',
              tenant: userData.tenant,
              manyToManyUniDirectional: expect.arrayContaining([
                expect.objectContaining({
                  testBaseRelationPk: toSave.manyToManyUniDirectional[0].testBaseRelationPk,
                }),
              ]),
            })
          );
        });

        it(`should NOT save with another tenant`, async () => {
          const toSave = plainToClass(TestBaseEntity, {
            manyToManyUniDirectional: [
              TEST_BASE_RELATION_CREATED[0],
              TEST_BASE_RELATION_CREATED[2],
            ],
          });

          return expect(
            queryService.updateWithRelations(entity.testEntityPk, toSave)
          ).rejects.toThrow(createErrorMessage('manyToManyUniDirectional'));
        });
      });
    });
  });
});
