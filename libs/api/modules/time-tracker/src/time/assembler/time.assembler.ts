import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { TimeEntity } from '../../domain/entity/time.entity';
import { TimeResponse } from '../dto/time.response';

@Assembler(TimeResponse, TimeEntity)
export class TimeAssembler extends ClassTransformerAssembler<TimeResponse, TimeEntity> {
  async convertAsyncToDTOsWithCount(
    entities: Promise<[TimeEntity[], number]>
  ): Promise<[TimeResponse[], number]> {
    const [items, count] = await entities;

    return [await this.customConvertAsyncToDTOs(items), count];
  }

  async customConvertAsyncToDTOs(entities: TimeEntity[]): Promise<TimeResponse[]> {
    const result = await Promise.all(entities.map((entity) => this.customConvertToDTO(entity)));

    return result;
  }

  async customConvertToDTO(entity: TimeEntity): Promise<TimeResponse> {
    const dto = new TimeResponse();

    dto.id = entity.id;
    dto.description = entity.description;
    dto.timeIntervalStart = entity.timeIntervalStart as string;
    dto.timeIntervalEnd = entity.timeIntervalEnd as string;
    dto.tags = await entity.tags;

    if (entity.project) {
      dto.project = {
        id: entity.project.id,
        name: entity.project.name,
        archived: entity.project.archived,
      };
    }

    return dto;
  }

  async convertAsyncToDTO(entity: Promise<TimeEntity>): Promise<TimeResponse> {
    const time = await entity;

    return this.customConvertToDTO(time);
  }

  async convertAsyncToDTOs(entities: Promise<TimeEntity[]>): Promise<TimeResponse[]> {
    const items = await entities;

    return this.customConvertAsyncToDTOs(items);
  }
}
