import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';
import { TypeOrmQueryService } from '@owl-app/nestjs-query-typeorm';

import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';
import { TransactionalRepository } from '@owl-app/lib-api-core/database/repository/transactional.repository';

import { TimeResponse } from '../../../dto/time.response';
import { TimeEntity } from '../../../../domain/entity/time.entity';
import { TimeAssembler } from '../../../assembler/time.assembler';

export class ContinueWatch {
  id: string;

  constructor(request: Partial<ContinueWatch> = {}) {
    Object.assign(this, request);
  }
}

@CommandHandler(ContinueWatch)
export class ContinueWatchHandler implements ICommandHandler<ContinueWatch> {
  constructor(
    @InjectAssemblerQueryService(TimeAssembler)
    readonly queryService: AppAssemblerQueryService<TimeResponse, TimeEntity>
  ) {}

  async execute(command: ContinueWatch): Promise<TimeResponse> {
    const repository = (
      this.queryService.queryService as unknown as TypeOrmQueryService<TimeEntity>
    ).repo as TransactionalRepository<TimeEntity>;

    const createTime = await repository.transaction(async () => {
      try {
        await this.queryService.updateWithRelations(
          { timeIntervalEnd: { is: null } },
          { timeIntervalEnd: new Date().toISOString() },
          { forceFilters: ['user'] }
        );
      } catch (error) {
        /* empty */
      }

      const copyTime = await this.queryService.getById(command.id, {
        relations: [
          {
            name: 'tags',
            query: {},
          },
        ],
      });

      const createdTime = this.queryService.createWithRelations({
        description: copyTime.description,
        timeIntervalStart: new Date().toISOString(),
        tags: await copyTime.tags,
      });

      return createdTime;
    });

    return createTime;
  }
}
