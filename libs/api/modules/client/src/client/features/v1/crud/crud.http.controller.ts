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
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  AvalilableCollections,
  ClientActions,
  CrudActions,
  createClientValidationSchema,
  updateClientValidationSchema,
} from '@owl-app/lib-contracts';

import { PaginatedQuery } from '@owl-app/lib-api-core/pagination/paginated.query';
import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { AppAssemblerQueryService } from '@owl-app/lib-api-core/query/core/services/app-assembler-query.service';

import { ClientEntity } from '../../../../domain/entity/client.entity';
import { ClientResponse } from '../../../dto/client.response';

import {
  CreateClientRequest,
  UpdateClientDto,
  FilterClientDto,
  ClientPaginatedResponseDto,
} from './dto';
import { ClientAssembler } from './client.assembler';
import { FindOneQuery } from './dto/find-one.query';

@ApiTags('Client')
@Controller('clients')
@ApiBearerAuth()
@Injectable()
export class ClientCrudController {
  constructor(
    @InjectAssemblerQueryService(ClientAssembler)
    readonly service: AppAssemblerQueryService<ClientResponse, ClientEntity>,
    @InjectPaginatedQueryService(ClientEntity)
    readonly paginatedService: DataProvider<Paginated<ClientEntity>, FilterClientDto, ClientEntity>
  ) {}

  @ApiOperation({ summary: 'Find client by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one client record',
    type: ClientResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
    type: ApiErrorResponse,
  })
  @Get(':id')
  @RoutePermissions(AvalilableCollections.CLIENT, CrudActions.READ)
  findOne(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true }))
    findOneQuery: FindOneQuery
  ): Promise<ClientResponse> {
    return this.service.getById(id, {
      relations: findOneQuery.withProjects ? [{ name: 'projects', query: {} }] : [],
    });
  }

  @ApiOperation({ summary: 'Create new client' })
  @ApiCreatedResponse({
    description: 'The Client has been successfully created.',
    type: ClientResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Post()
  @RoutePermissions(AvalilableCollections.CLIENT, CrudActions.CREATE)
  async create(
    @Body(new ValibotValidationPipe(createClientValidationSchema))
    createClientRequest: CreateClientRequest
  ) {
    const createdClient = await this.service.createOne(createClientRequest);

    return createdClient;
  }

  @ApiOperation({ summary: 'Update Client' })
  @ApiAcceptedResponse({
    description: 'Client has been successfully updated.',
    type: ClientResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':id')
  @RoutePermissions(AvalilableCollections.CLIENT, CrudActions.UPDATE)
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(updateClientValidationSchema))
    updateClientDto: UpdateClientDto
  ): Promise<ClientResponse> {
    const updatedClient = await this.service.updateOne(id, updateClientDto);

    return updatedClient;
  }

  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Client has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  @RoutePermissions(AvalilableCollections.CLIENT, CrudActions.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.deleteOne(id, { filter: { archived: { is: true } } });
  }

  @ApiOperation({ summary: 'Find all clients by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: ClientPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get()
  @RoutePermissions(AvalilableCollections.CLIENT, [CrudActions.LIST, ClientActions.AVAILABLE])
  async paginated(
    @Query('filters') filters: FilterClientDto,
    @Query() pagination: PaginatedQuery
  ): Promise<ClientPaginatedResponseDto> {
    const paginated = await this.paginatedService.getData(filters, pagination);

    return new ClientPaginatedResponseDto(paginated);
  }
}
