import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AvalilableCollections, TimeActions } from '@owl-app/lib-contracts';
import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';

import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';

import { TimeAssembler } from '../../../assembler/time.assembler';
import { TimeResponse } from '../../../dto/time.response';
import { TimeEntity } from '../../../../domain/entity/time.entity';

@ApiTags('Time Tracker Manage')
@Controller('times')
@ApiBearerAuth()
@ApiResponse({ status: 500, description: 'Internal error' })
export class InProgressController {
  constructor(
    @InjectAssemblerQueryService(TimeAssembler)
    readonly queryService: AppAssemblerQueryService<TimeResponse, TimeEntity>
  ) {}

  @ApiOperation({ description: 'In progress' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time started watching',
    type: TimeResponse,
  })
  @Get('in-progress')
  @RoutePermissions(AvalilableCollections.TIME, TimeActions.IN_PROGRESS)
  async inProgress(): Promise<TimeResponse | null> {
    const time = await this.queryService.query(
      {
        filter: {
          timeIntervalEnd: { is: null },
        },
        relations: [
          {
            name: 'tags',
            query: {},
          },
          {
            name: 'project',
            query: {},
          },
        ],
      },
      {
        forceFilters: ['user'],
      }
    );

    if (time) {
      return time.shift();
    }

    return null;
  }
}
