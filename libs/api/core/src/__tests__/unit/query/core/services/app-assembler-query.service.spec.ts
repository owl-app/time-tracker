import { omit } from 'lodash';
import { instanceToInstance, instanceToPlain, plainToClass } from 'class-transformer';

import { AppAssemblerQueryService } from '../../../../../query/core/services/app-assembler-query.service';

import { TEST_BASE_ENTITIES_CREATED } from '../../../../seeds/data/tes-base-entity.data';
import { TestBaseResponse } from '../../../../__fixtures__/dto/test-base.response';
import { TestBaseAssembler } from '../../../../__fixtures__/assembler/test-base.assembler';
import { TestBaseEntity } from '../../../../__fixtures__/test-base.entity';

describe('AppAssemblerQueryService', () => {
  let service: AppAssemblerQueryService<any, any>;
  let mockQueryService: {
    query: jest.Mock;
    queryOne: jest.Mock;
    createWithRelations: jest.Mock;
    updateWithRelations: jest.Mock;
  };
  let assembler: TestBaseAssembler;
  let entity: TestBaseEntity;
  let dto: TestBaseResponse;

  beforeEach(() => {
    mockQueryService = {
      query: jest.fn(),
      queryOne: jest.fn(),
      createWithRelations: jest.fn(),
      updateWithRelations: jest.fn(),
    };
    assembler = new TestBaseAssembler(TestBaseResponse, TestBaseEntity);
    service = new AppAssemblerQueryService<any, any>(assembler, mockQueryService as any);
    entity = plainToClass(
      TestBaseEntity,
      omit(TEST_BASE_ENTITIES_CREATED[0], 'tenant', 'testBaseRelations')
    );
    dto = plainToClass(TestBaseResponse, instanceToPlain(entity));
  });

  it('query', async () => {
    mockQueryService.query.mockResolvedValue([entity]);

    const result = await service.query({});

    expect(result).toStrictEqual([dto]);
  });

  it('queryOne', async () => {
    mockQueryService.queryOne.mockResolvedValue(entity);

    const result = await service.queryOne({});

    expect(result).toStrictEqual(dto);
  });

  it('createWithRelations', async () => {
    const inputDto = instanceToInstance(dto);
    inputDto.archived = false;

    mockQueryService.createWithRelations.mockResolvedValue(entity);

    const result = await service.createWithRelations(inputDto);

    expect(mockQueryService.createWithRelations).toHaveBeenCalledWith(
      omit(entity, 'archived'),
      undefined,
      undefined
    );

    expect(result).toStrictEqual(dto);
  });

  it('updateWithRelations', async () => {
    const inputDto = instanceToInstance(dto);
    inputDto.archived = false;

    mockQueryService.updateWithRelations.mockResolvedValue(entity);

    const result = await service.updateWithRelations(entity.testEntityPk, inputDto);

    expect(mockQueryService.updateWithRelations).toHaveBeenCalledWith(
      entity.testEntityPk,
      omit(entity, 'archived'),
      undefined
    );

    expect(result).toStrictEqual(dto);
  });
});
