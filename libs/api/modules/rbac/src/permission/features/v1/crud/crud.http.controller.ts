import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Injectable,
  Put,
  HttpCode,
  Delete,
  Param,
  Get,
  Query,
  UsePipes,
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
  permissionValidationSchema,
} from '@owl-app/lib-contracts';
import { AssemblerQueryService, InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { ApiErrorValidationResponse } from '@owl-app/lib-api-core/api/api-error-validation.response';

import { PermissionEntity } from '../../../../domain/entity/permission.entity';

import { CreatePermissionRequest } from './dto/create-permission.request.dto';
import { PermissionResponse } from './dto/permission.response.dto';
import { UpdatePermissionRequest } from './dto/update-permission.request.dto';
import { PermissionAssembler } from './permission.assembler';
import { FilterPermissionDto, PermissionPaginatedResponseDto } from './dto';
import { PermissionPaginatedQuery } from './dto/permission-paginated.query';

@ApiTags('Rbac Permission')
@Controller('rbac/permissions')
@ApiBearerAuth()
@Injectable()
export class RbacPermissionCrudController {
  constructor(
    @InjectAssemblerQueryService(PermissionAssembler)
    readonly service: AssemblerQueryService<PermissionResponse, PermissionEntity>,
    @InjectPaginatedQueryService(PermissionEntity)
    readonly paginatedService: DataProvider<
      Paginated<PermissionResponse>,
      FilterPermissionDto,
      PermissionEntity
    >
  ) {}

  @ApiOperation({ summary: 'Find permission by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one permission record',
    type: PermissionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
    type: PermissionResponse,
  })
  @Get(':id')
  @RoutePermissions(AvalilableCollections.PERMISSION, CrudActions.READ)
  async findOne(@Param('id') id: string): Promise<PermissionResponse> {
    const permission = await this.service.getById(id);

    return permission;
  }

  @ApiOperation({ summary: 'Create new permission' })
  @ApiCreatedResponse({
    description: 'The permission has been successfully created.',
    type: PermissionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation errors.',
    type: ApiErrorValidationResponse,
  })
  @Post()
  @RoutePermissions(AvalilableCollections.PERMISSION, CrudActions.CREATE)
  @UsePipes(new ValibotValidationPipe(permissionValidationSchema))
  async createPermission(@Body() createPermissionDto: CreatePermissionRequest) {
    const addedPermission = await this.service.createOne(createPermissionDto);

    return addedPermission;
  }

  @ApiOperation({ summary: 'Update permission' })
  @ApiAcceptedResponse({
    description: 'Permission has been successfully updated.',
    type: PermissionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Put(':name')
  @RoutePermissions(AvalilableCollections.PERMISSION, CrudActions.UPDATE)
  async updatePermission(
    @Param('name') name: string,
    @Body(new ValibotValidationPipe(permissionValidationSchema))
    updatePermissionDto: UpdatePermissionRequest
  ) {
    const updatedPermission = await this.service.updateOne(name, updatePermissionDto);

    return updatedPermission;
  }

  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Permission has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':name')
  @RoutePermissions(AvalilableCollections.PERMISSION, CrudActions.DELETE)
  async remove(@Param('name') name: string): Promise<void> {
    await this.service.deleteOne(name);
  }

  @ApiOperation({ summary: 'Find all permissions by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: PermissionPaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get()
  @RoutePermissions(AvalilableCollections.PERMISSION, CrudActions.LIST)
  async paginated(
    @Query('filters') filters: FilterPermissionDto,
    @Query(new ValidationPipe({ transform: true }))
    pagination: PermissionPaginatedQuery
  ): Promise<PermissionPaginatedResponseDto> {
    const paginated = await this.paginatedService.getData(
      filters,
      pagination.pageable === 0 ? null : pagination
    );

    return new PermissionPaginatedResponseDto(paginated);
  }
}
