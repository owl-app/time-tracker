import { EntityMetadata, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesEnum, Role } from '@owl-app/lib-contracts';

import { RequestContextService } from '../../context/app-request-context';

import { ROLE_ENTITY } from '../../entity-tokens';
import { FilterQuery } from '../../registry/interfaces/filter-query';

@Injectable()
export class RolesFilter<Entity extends Role> implements FilterQuery<Entity> {
  constructor(readonly configService: ConfigService) {}

  supports(metadata: EntityMetadata): boolean {
    return (
      metadata.name === ROLE_ENTITY &&
      RequestContextService.getCurrentUser() &&
      RequestContextService.getCurrentUser().roles.includes(RolesEnum.ROLE_ADMIN_COMPANY)
    );
  }

  execute(qb: SelectQueryBuilder<Entity>): void {
    qb.andWhere(`${qb.alias}.name IN(:roles)`).setParameter('roles', [
      RolesEnum.ROLE_ADMIN_COMPANY,
      RolesEnum.ROLE_USER,
    ]);
  }
}
