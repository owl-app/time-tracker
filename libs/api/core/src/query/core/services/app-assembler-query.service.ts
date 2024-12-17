import {
  DeepPartial,
  AssemblerQueryService,
  Assembler,
  Filter,
  Query,
} from '@owl-app/nestjs-query-core';
import { AppQueryService } from '../interfaces/app-query.service';
import { QueryOptions } from '../interfaces/query-options';

export class AppAssemblerQueryService<
    DTO,
    Entity,
    C = DeepPartial<DTO>,
    CE = DeepPartial<Entity>,
    U = C,
    UE = CE
  >
  extends AssemblerQueryService<DTO, Entity, C, CE, U, UE>
  implements AppQueryService<DTO, C, U>
{
  constructor(
    readonly assembler: Assembler<DTO, Entity, C, CE, U, UE>,
    readonly queryService: AppQueryService<Entity, CE, UE>
  ) {
    super(assembler, queryService);
  }

  query(query: Query<DTO>, opts?: QueryOptions): Promise<DTO[]> {
    return this.assembler.convertAsyncToDTOs(
      this.queryService.query(this.assembler.convertQuery(query), opts)
    );
  }

  async createWithRelations(item: C, filter?: Filter<DTO>, opts?: QueryOptions): Promise<DTO> {
    const c = this.queryService.createWithRelations(
      await this.assembler.convertToCreateEntity(item),
      this.convertToFilter(filter),
      opts
    );
    return this.assembler.convertAsyncToDTO(c);
  }

  async updateWithRelations(
    id: number | string | Filter<DTO>,
    update: U,
    opts?: QueryOptions
  ): Promise<DTO> {
    const c = this.queryService.updateWithRelations(
      typeof id === 'object' ? this.convertToFilter(id) : id,
      await this.assembler.convertToUpdateEntity(update),
      opts
    );

    return this.assembler.convertAsyncToDTO(c);
  }

  convertToFilter(query: Filter<DTO>): Filter<Entity> {
    return query as unknown as Filter<Entity>;
  }
}
