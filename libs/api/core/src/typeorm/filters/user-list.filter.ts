import { EntityMetadata, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesEnum, User } from '@owl-app/lib-contracts';

import { RequestContextService } from '../../context/app-request-context';

import { USER_ENTITY } from '../../entity-tokens';
import { FilterQuery } from '../../registry/interfaces/filter-query';

@Injectable()
export class UserListFilter<Entity extends User> implements FilterQuery<Entity> {
  constructor(readonly configService: ConfigService) {}

  supports(metadata: EntityMetadata): boolean {
    return (
      metadata.name === USER_ENTITY &&
      RequestContextService.getCurrentUser() &&
      RequestContextService.getCurrentUser() &&
      (RequestContextService.getCurrentUser().roles.includes(RolesEnum.ROLE_ADMIN_COMPANY) ||
        RequestContextService.getCurrentUser().roles.includes(RolesEnum.ROLE_USER))
    );
  }

  execute(qb: SelectQueryBuilder<Entity>): void {
    if (!this.hasJoinedRelation(qb, 'roles')) {
      qb.leftJoin(`${qb.alias}.roles`, 'roles');
    }

    qb.andWhere(`roles.name IN (:roles)`).setParameter('roles', [
      RolesEnum.ROLE_ADMIN_COMPANY,
      RolesEnum.ROLE_USER,
    ]);
  }

  private hasJoinedRelation(qb: SelectQueryBuilder<Entity>, relation: string) {
    return qb.expressionMap.joinAttributes.some((join) => join.alias.name === relation);
  }
}
