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
  RoleActions,
  roleValidationSchema,
} from '@owl-app/lib-contracts';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { PaginatedQuery } from '@owl-app/lib-api-core/pagination/paginated.query';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import { AssemblerQueryService, InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';

import { RoleResponse } from '../../../dto/role.response.dto';
import { CreateRoleRequest } from '../../../dto/create-role.request.dto';
import { UpdateRoleRequest } from '../../../dto/update-role.request.dto';
import { RoleEntity } from '../../../../domain/entity/role.entity';

import { FilterRoleDto } from './dto';
import { RolePaginatedResponseDto } from './dto/role.paginated.response.dto';
import { RoleAssembler } from './role.assembler';

@ApiTags('Rbac Role')
@Controller('rbac/roles')
@ApiBearerAuth()
@Injectable()
export class CrudController {
  constructor(
    @InjectAssemblerQueryService(RoleAssembler)
    readonly service: AssemblerQueryService<RoleResponse, RoleEntity>,
    @InjectPaginatedQueryService(RoleEntity)
    readonly paginatedService: DataProvider<Paginated<RoleResponse>, FilterRoleDto, RoleEntity>
  ) {}

  @ApiOperation({ summary: 'Find role by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one role record',
    type: RoleResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
    type: RoleResponse,
  })
  @RoutePermissions(AvalilableCollections.ROLE, CrudActions.READ)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoleResponse> {
    const role = await this.service.getById(id, {
      relations: [{ name: 'setting', query: {} }],
    });

    return role;
  }

  @ApiOperation({ summary: 'Create new role' })
  @ApiCreatedResponse({
    description: 'The role has been successfully created.',
    type: RoleResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Post()
  @RoutePermissions(AvalilableCollections.ROLE, CrudActions.CREATE)
  @UsePipes(new ValibotValidationPipe(roleValidationSchema))
  async createRole(@Body() createRoleDto: CreateRoleRequest) {
    const addedRole = await this.service.createOne(createRoleDto);

    return addedRole;
  }

  @ApiOperation({ summary: 'Update role' })
  @ApiAcceptedResponse({
    description: 'Role has been successfully updated.',
    type: RoleResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':name')
  @RoutePermissions(AvalilableCollections.ROLE, CrudActions.UPDATE)
  async updateRole(@Param('name') name: string, @Body() updateRoleDto: UpdateRoleRequest) {
    const updatedRole = await this.service.updateOne(name, updateRoleDto);

    return updatedRole;
  }

  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Role has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':name')
  @RoutePermissions(AvalilableCollections.ROLE, CrudActions.DELETE)
  async remove(@Param('name') name: string): Promise<void> {
    await this.service.deleteOne(name);
  }

  @ApiOperation({ summary: 'Find all roles by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: RolePaginatedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Get()
  @RoutePermissions(AvalilableCollections.ROLE, [CrudActions.LIST, RoleActions.AVAILABLE])
  async paginated(
    @Query('filters') filters: FilterRoleDto,
    @Query() pagination: PaginatedQuery
  ): Promise<RolePaginatedResponseDto> {
    const paginated = await this.paginatedService.getData(filters, pagination);

    return new RolePaginatedResponseDto(paginated);
  }
}
