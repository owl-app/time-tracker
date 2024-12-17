import { Response } from 'express';

import { Controller, HttpStatus, Get, Query, Injectable, Inject, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AvalilableCollections, TimeActions } from '@owl-app/lib-contracts';

import { SortDirection } from '@owl-app/nestjs-query-core';

import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';

import { TimeEntity } from '../../../../domain/entity/time.entity';
import { TimeResponse } from '../../../dto/time.response';
import { FilterTimeRequest } from '../../../dto';
import { CsvGenerator } from './csv.generator';

@ApiTags('Time Tracker Manage')
@Controller('times')
@ApiBearerAuth()
@Injectable()
export class ExportController {
  constructor(
    @Inject(CsvGenerator)
    readonly csvGenerator: CsvGenerator,
    @InjectPaginatedQueryService(TimeEntity)
    readonly paginatedService: DataProvider<Paginated<TimeResponse>, FilterTimeRequest, TimeEntity>
  ) {}

  @ApiOperation({ summary: 'Export all times by filters' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get('export-csv')
  @RoutePermissions(AvalilableCollections.TIME, TimeActions.EXPORT_CSV)
  async csvExport(
    @Query('filters') filters: FilterTimeRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    const data = await this.paginatedService.getData(filters, null, {
      field: 'timeIntervalEnd',
      direction: SortDirection.DESC,
    });

    this.csvGenerator.generate(data, response);
  }
}
