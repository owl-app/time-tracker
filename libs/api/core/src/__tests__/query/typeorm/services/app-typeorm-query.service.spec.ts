import { ObjectLiteral, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { Inject } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigModule, registerAs } from '@nestjs/config';

import { Registry } from '@owl-app/registry';
import { DeepPartial } from '@owl-app/nestjs-query-core';
import { TenantAware } from '@owl-app/lib-contracts';
import { Class } from '@owl-app/types';
import { dbInitializer, dbRefresh } from '@owl-app/testing';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';
import { RequestContextModule } from '@owl-app/request-context-nestjs';

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
import { DatabaseModule } from '../../../../database/database.module';
import {
  TEST_BASE_ENTITIES_CREATED,
  TEST_SIMPLE_ENTITIES_NEW,
  TEST_SIMPLE_ENTITIES_CREATED,
} from '../../../seeds/data/test-entity.data';
import { FILTER_REGISTRY_TENANT, SETTER_REGISTRY_TENANT } from '../../../../registry/constants';
import { FilterQuery } from '../../../../registry/interfaces/filter-query';
import { TenantRelationFilter } from '../../../../typeorm/filters/tenant-relation.filter';
import { TenantRelationSetter } from '../../../../typeorm/setters/tenant-relation.setter';
import { EntitySetter } from '../../../../registry/interfaces/entity-setter';

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
  const createTest = <Entity extends EntityClassOrSchema>(
    entity: Entity,
    repository: Class<Repository<any>>,
    useTransaction = true,
    withEventEmitter = true
  ): [TestingModuleBuilder, Class<AppTypeOrmQueryService<any>>] => {
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
      imports: [
        ...imports,
        ...[
          RequestContextModule,
          ConfigModule.forRoot({
            isGlobal: true,
            load: [registerAs(DB_CONFIG_NAME, () => Object.assign(getDbConfig()))],
          }),
          DatabaseModule,
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
    });

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

                moduleRef = await testingModule.compile();

                repository = moduleRef.get(getQueryServiceRepositoryToken(TestSimpleEntity));

                await dbRefresh({
                  dataSource: moduleRef.get(getDataSourceToken()),
                  seeds: [TestEntitySeeder],
                });

                queryService = moduleRef.get(testingService);

                saveSpy = jest.spyOn(repository, 'save');

                if (repository instanceof BaseRepository) {
                  transactionSpy = jest.spyOn(repository, 'transaction');
                }
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
                  const spyCreateEvent = jest.spyOn(queryService as any, 'createEvent');
                  await runMethodInstanceObject(queryService, methodName, ...args);

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

  describe('#createOne', () => {
    transactionSupport('createOne', TEST_SIMPLE_ENTITIES_NEW[0]);

    let moduleRef: TestingModule;
    let repository: Repository<TestSimpleEntity>;
    let queryService: AppTypeOrmQueryService<TestBaseEntity>;
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

      moduleRef = await testingModule.compile();

      repository = moduleRef.get(getQueryServiceRepositoryToken(TestBaseEntity));

      await dbRefresh({
        dataSource: moduleRef.get(getDataSourceToken()),
        seeds: [TestEntitySeeder],
      });

      queryService = moduleRef.get(testingService);

      saveSpy = jest.spyOn(repository, 'save');
    });

    afterEach(() => {
      const dataSource = moduleRef.get(getDataSourceToken());
      return dataSource.destroy();
    });

    it(`should save entity with domain event "TEST_BASE_ENTITY_CREATED"`, async () => {
      const entity = plainToClass(TestBaseEntity, TEST_SIMPLE_ENTITIES_NEW[0]);
      const entityPublishEventsSpy = jest.spyOn(entity, 'addEvent');

      await queryService.createOne(entity);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(entityPublishEventsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'TEST_BASE_ENTITY_CREATED',
        })
      );
      expect(entityPublishEventsSpy).toHaveBeenCalledTimes(1);
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

  describe('#createWithRelations', () => {
    transactionSupport('createWithRelations', TEST_SIMPLE_ENTITIES_NEW[0]);
  });

  describe('#updateWithRelations', () => {
    transactionSupport('updateWithRelations', TEST_SIMPLE_ENTITIES_CREATED[0].testEntityPk, {
      stringType: 'updated',
    });
  });
});
