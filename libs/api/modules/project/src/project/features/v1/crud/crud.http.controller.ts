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
  CrudActions,
  ProjectActions,
  projectValidationSchema,
} from '@owl-app/lib-contracts';

import { AssemblerQueryService, InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';

import { ProjectEntity } from '../../../../domain/entity/project.entity';
import { ProjectResponse } from '../../../dto/project.response';

import {
  CreateProjectRequest,
  UpdateProjectRequest,
  FilterProjectQuery,
  ProjectPaginatedResponse,
} from './dto';
import { ProjectAssembler } from './project.assembler';
import { ProjectPaginatedQuery } from './dto/project-paginated.query';

@ApiTags('Projects')
@Controller('projects')
@ApiBearerAuth()
@Injectable()
export class ProjectCrudController {
  constructor(
    @InjectAssemblerQueryService(ProjectAssembler)
    readonly service: AssemblerQueryService<ProjectResponse, ProjectEntity>,
    @InjectPaginatedQueryService(ProjectEntity)
    readonly paginatedService: DataProvider<
      Paginated<ProjectEntity>,
      FilterProjectQuery,
      ProjectEntity
    >
  ) {}

  @ApiOperation({ summary: 'Find project by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one project record',
    type: ProjectResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
    type: ApiErrorResponse,
  })
  @Get(':id')
  @RoutePermissions(AvalilableCollections.PROJECT, CrudActions.READ)
  findOne(@Param('id') id: string): Promise<ProjectResponse> {
    return this.service.getById(id, {
      relations: [{ name: 'client', query: {} }],
    });
  }

  @ApiOperation({ summary: 'Create new project' })
  @ApiCreatedResponse({
    description: 'The project has been successfully created.',
    type: ProjectResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Post()
  @RoutePermissions(AvalilableCollections.PROJECT, CrudActions.CREATE)
  async create(
    @Body(new ValibotValidationPipe(projectValidationSchema))
    createProjectRequest: CreateProjectRequest
  ) {
    const created = await this.service.createOne(createProjectRequest);

    return created;
  }

  @ApiOperation({ summary: 'Update project' })
  @ApiAcceptedResponse({
    description: 'Project has been successfully updated.',
    type: ProjectResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':id')
  @RoutePermissions(AvalilableCollections.PROJECT, CrudActions.UPDATE)
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(projectValidationSchema))
    updateProjectRequest: UpdateProjectRequest
  ): Promise<ProjectResponse> {
    const updated = await this.service.updateOne(id, updateProjectRequest);

    return updated;
  }

  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Project has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  @RoutePermissions(AvalilableCollections.PROJECT, CrudActions.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.deleteOne(id, { filter: { archived: { is: true } } });
  }

  @ApiOperation({ summary: 'Find all projects by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: ProjectPaginatedResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get()
  @RoutePermissions(AvalilableCollections.PROJECT, [CrudActions.LIST, ProjectActions.AVAILABLE])
  async paginated(
    @Query('filters') filters: FilterProjectQuery,
    @Query(new ValidationPipe({ transform: true }))
    pagination: ProjectPaginatedQuery
  ): Promise<ProjectPaginatedResponse> {
    const paginated = await this.paginatedService.getData(
      filters,
      pagination.pageable === 0 ? null : pagination
    );

    return new ProjectPaginatedResponse(paginated);
  }
}
