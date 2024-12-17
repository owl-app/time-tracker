import { instance, mock } from 'ts-mockito';
import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueryServiceToken } from '@owl-app/nestjs-query-core';

import { createTypeOrmQueryServiceProviders } from '../lib/providers';
import { TypeOrmQueryService } from '../lib/services';

describe('createTypeOrmQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    class TestEntity {}

    const mockRepo = mock<Repository<TestEntity>>(Repository);
    const providers = createTypeOrmQueryServiceProviders([{ entity: TestEntity }]);
    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([getRepositoryToken(TestEntity)]);
    expect(providers[0].useFactory(instance(mockRepo))).toBeInstanceOf(TypeOrmQueryService);
  });
});
