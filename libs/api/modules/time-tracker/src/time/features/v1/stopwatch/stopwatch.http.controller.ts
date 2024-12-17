import { Body, Controller, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  AvalilableCollections,
  stopTimeValidationSchema,
  TimeActions,
} from '@owl-app/lib-contracts';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';

import { ApiErrorValidationResponse } from '@owl-app/lib-api-core/api/api-error-validation.response';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { TimeEntity } from '../../../../domain/entity/time.entity';
import { TimeResponse } from '../../../dto/time.response';
import { TimeAssembler } from '../../../assembler/time.assembler';
import { WatchRequest } from './dto/watch.request';
import { ContinueWatch } from './continue-watch.service';
import { StopRequest } from './dto/stop.request';

@ApiTags('Time Tracker Manage')
@Controller('times')
@ApiBearerAuth()
@ApiResponse({ status: 500, description: 'Internal error' })
export class StopWathController {
  constructor(
    @InjectAssemblerQueryService(TimeAssembler)
    readonly queryService: AppAssemblerQueryService<TimeResponse, TimeEntity>,
    private readonly commandBus: CommandBus
  ) {}

  @ApiOperation({ summary: 'Start watching' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: WatchRequest })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time started watching',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @Post('/stopwatch')
  @RoutePermissions(AvalilableCollections.TIME, TimeActions.START_WATCH)
  async watch(@Body() watch: WatchRequest): Promise<TimeResponse> {
    const createdTime = await this.queryService.createWithRelations(
      { ...watch, timeIntervalStart: new Date().toISOString() },
      { timeIntervalEnd: { is: null } },
      { forceFilters: ['user'] }
    );

    return createdTime;
  }

  @ApiOperation({ summary: 'Continue watching' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time continue watching',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @Post('/stopwatch/:id')
  @RoutePermissions(AvalilableCollections.TIME, TimeActions.CONTINUE_WATCH)
  async countinueWatch(@Param('id') id: string): Promise<TimeResponse> {
    const result = await this.commandBus.execute<TimeResponse>(new ContinueWatch({ id }));

    return result;
  }

  @ApiOperation({ summary: 'Stop watching' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: WatchRequest })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time stopped watching',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @Put('/stopwatch')
  @RoutePermissions(AvalilableCollections.TIME, TimeActions.STOP_WATCH)
  async stop(
    @Body(new ValibotValidationPipe(stopTimeValidationSchema)) stop: StopRequest
  ): Promise<TimeResponse> {
    const updatedTime = await this.queryService.updateWithRelations(
      { timeIntervalEnd: { is: null } },
      { ...stop, ...{ timeIntervalEnd: new Date().toISOString() } },
      { forceFilters: ['user'] }
    );

    return updatedTime;
  }
}
