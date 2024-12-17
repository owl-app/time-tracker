import { EntityMetadata, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Archivable, RolesEnum } from '@owl-app/lib-contracts';

import { RequestContextService } from '../../context/app-request-context';

import { FilterQuery } from '../../registry/interfaces/filter-query';

@Injectable()
export class NonArchivedFilter<Entity extends Archivable> implements FilterQuery<Entity> {
  constructor(readonly configService: ConfigService) {}

  supports(metadata: EntityMetadata): boolean {
    return (
      metadata.columns.some((column) => column.propertyName === 'archived') &&
      RequestContextService.getCurrentUser() &&
      RequestContextService.getCurrentUser().roles.includes(RolesEnum.ROLE_USER)
    );
  }

  execute(qb: SelectQueryBuilder<Entity>): void {
    qb.andWhere(`${qb.alias}.archived = :archived`, { archived: false });
  }
}
