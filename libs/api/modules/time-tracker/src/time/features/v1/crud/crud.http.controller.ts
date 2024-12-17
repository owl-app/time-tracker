import {
  Controller,
  HttpStatus,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  Injectable,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AvalilableCollections, CrudActions, timeValidationSchema } from '@owl-app/lib-contracts';

import { PaginatedQuery } from '@owl-app/lib-api-core/pagination/paginated.query';
import { InjectAssemblerQueryService, SortDirection } from '@owl-app/nestjs-query-core';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { TimeEntity } from '../../../../domain/entity/time.entity';
import { TimeResponse } from '../../../dto/time.response';
import { TimeAssembler } from '../../../assembler/time.assembler';
import { CreateTimeRequest, UpdateTimeRequest, TimePaginatedResponse } from './dto';
import { FilterTimeRequest } from '../../../dto';

@ApiTags('Time Tracker Manage')
@Controller('times')
@ApiBearerAuth()
@Injectable()
export class TimeCrudController {
  constructor(
    @InjectAssemblerQueryService(TimeAssembler)
    readonly service: AppAssemblerQueryService<TimeResponse, TimeEntity>,
    @InjectPaginatedQueryService(TimeEntity)
    readonly paginatedService: DataProvider<Paginated<TimeResponse>, FilterTimeRequest, TimeEntity>
  ) {}

  @ApiOperation({ summary: 'Find time by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one time record',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Time not found',
    type: ApiErrorResponse,
  })
  @Get(':id')
  @RoutePermissions(AvalilableCollections.TIME, CrudActions.READ)
  findOne(@Param('id') id: string): Promise<TimeResponse> {
    return this.service.getById(id, {
      relations: [{ name: 'users', query: {} }],
    });
  }

  @ApiOperation({ summary: 'Create new time' })
  @ApiCreatedResponse({
    description: 'The time has been successfully created.',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Post()
  @RoutePermissions(AvalilableCollections.TIME, CrudActions.CREATE)
  async create(
    @Body(new ValibotValidationPipe(timeValidationSchema))
    createTimeRequest: CreateTimeRequest
  ) {
    const createdTime = await this.service.createWithRelations(createTimeRequest);

    return createdTime;
  }

  @ApiOperation({ summary: 'Update time' })
  @ApiAcceptedResponse({
    description: 'Time has been successfully updated.',
    type: TimeResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Time not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':id')
  @RoutePermissions(AvalilableCollections.TIME, CrudActions.UPDATE)
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(timeValidationSchema))
    updateTimeRequest: UpdateTimeRequest
  ): Promise<TimeResponse> {
    const updatedTime = await this.service.updateWithRelations(id, updateTimeRequest);

    return updatedTime;
  }

  @ApiOperation({ summary: 'Delete time' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Time has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  @RoutePermissions(AvalilableCollections.TIME, CrudActions.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.deleteOne(id);
  }

  @ApiOperation({ summary: 'Find all times by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: TimePaginatedResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get()
  @RoutePermissions(AvalilableCollections.TIME, CrudActions.LIST)
  async paginated(
    @Query('filters') filters: FilterTimeRequest,
    @Query() pagination: PaginatedQuery
  ): Promise<TimePaginatedResponse> {
    const paginated = await this.paginatedService.getData(filters, pagination, {
      field: 'createdAt',
      direction: SortDirection.DESC,
    });

    return new TimePaginatedResponse(paginated);
  }
}
