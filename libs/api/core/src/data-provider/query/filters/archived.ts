import { SelectQueryBuilder } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { ArchiveOptions } from '@owl-app/lib-contracts';

import { FilterCustom } from '../../filtering/filter-custom';

export interface FilterArchivedQuery {
  archived?: ArchiveOptions;
}

export class FilterArchivedApiProperty implements FilterArchivedQuery {
  @ApiProperty({ enum: ArchiveOptions })
  @IsOptional()
  archived?: ArchiveOptions;
}

export class ArchivedFilter<Entity> implements FilterCustom<SelectQueryBuilder<Entity>> {
  apply<QueryData extends FilterArchivedQuery>(
    data: QueryData,
    qb: SelectQueryBuilder<Entity>
  ): void {
    switch (data?.archived) {
      case ArchiveOptions.ARCHIVED:
        qb.andWhere(`${qb.alias}.archived = 1`);
        break;
      case ArchiveOptions.ACTIVE:
        qb.andWhere(`${qb.alias}.archived = 0`);
        break;
      default:
        qb.andWhere(`(${qb.alias}.archived = 1 OR ${qb.alias}.archived = 0)`);
        break;
    }
  }
}
