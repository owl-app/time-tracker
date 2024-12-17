import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AvalilableCollections, Client, CommonActions } from '@owl-app/lib-contracts';

import { DomainEvent } from '@owl-app/lib-api-core/event/domain-event.base';
import { InjectRepository } from '@owl-app/lib-api-core/typeorm/common/typeorm.decorators';
import { InjectableRepository } from '@owl-app/lib-api-core/database/repository/injectable.repository';
import { checkPermissionToRoute } from '@owl-app/lib-api-core/utils/check-permission';

import { ProjectEntity } from '../../domain/entity/project.entity';

@Injectable()
export class ArchiveProjectsWhenClientIsArchivedDomainEventHandler {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: InjectableRepository<ProjectEntity>
  ) {}

  @OnEvent('CLIENT_ENTITY_ARCHIVED', { async: true, promisify: true, suppressErrors: false })
  async handle(event: DomainEvent & Client & { withProjects: boolean }): Promise<void> {
    if (
      event.withProjects &&
      checkPermissionToRoute(AvalilableCollections.PROJECT, CommonActions.ARCHIVE)
    ) {
      await this.projectRepository.update(
        {
          client: { id: event.id },
        },
        { archived: event.archived }
      );
    }
  }
}
