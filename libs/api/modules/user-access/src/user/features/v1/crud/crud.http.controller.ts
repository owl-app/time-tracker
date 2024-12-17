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

import {
  AvalilableCollections,
  CrudActions,
  createUserValidationSchema,
  updateUserValidationSchema,
} from '@owl-app/lib-contracts';
import { InjectAssemblerQueryService } from '@owl-app/nestjs-query-core';

import type { AppQueryService } from '@owl-app/lib-api-core/query/core/interfaces/app-query.service';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { Paginated } from '@owl-app/lib-api-core/pagination/pagination';
import type { DataProvider } from '@owl-app/lib-api-core/data-provider/data.provider';
import { PaginatedQuery } from '@owl-app/lib-api-core/pagination/paginated.query';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { ApiErrorResponse } from '@owl-app/lib-api-core/api/api-error.response';
import { InjectPaginatedQueryService } from '@owl-app/lib-api-core/data-provider/query/decorators/inject-paginated-query.decorator';
import { ApiFilterQuery } from '@owl-app/lib-api-core/data-provider/query/decorators/api-filter-query.decorator';
import { FilterStringApiProperty } from '@owl-app/lib-api-core/data-provider/query/filters/string';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';

import { UserEntity } from '../../../../domain/entity/user.entity';
import { UserDto } from '../../../dto/user.dto';

import { CreateUserRequest, UpdateUserRequest, FilterUserDto, UserPaginatedResponse } from './dto';
import { UserAssembler } from './user.assembler';

@ApiTags('User')
@Controller('users')
@ApiBearerAuth()
@Injectable()
export class UserCrudController {
  constructor(
    @InjectAssemblerQueryService(UserAssembler)
    readonly service: AppQueryService<UserEntity>,
    @InjectPaginatedQueryService(UserEntity)
    readonly paginatedService: DataProvider<Paginated<UserEntity>, FilterUserDto, UserEntity>
  ) {}

  @ApiOperation({ summary: 'Find user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found one user record',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiErrorResponse,
  })
  @Get(':id')
  @RoutePermissions(AvalilableCollections.USER, CrudActions.READ)
  async findOne(@Param('id') id: string) {
    const relations = [
      {
        name: 'roles',
        query: {
          relations: [
            {
              name: 'setting',
              query: {},
            },
          ],
        },
      },
    ];
    const user = await this.service.getById(id, { relations });

    return user;
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @Post()
  @RoutePermissions(AvalilableCollections.USER, CrudActions.CREATE)
  async create(
    @Body(new ValibotValidationPipe(createUserValidationSchema))
    createUserRequest: CreateUserRequest
  ) {
    const createdUser = await this.service.createWithRelations(createUserRequest);

    return createdUser;
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiAcceptedResponse({
    description: 'User has been successfully updated.',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Put(':id')
  @RoutePermissions(AvalilableCollections.USER, CrudActions.UPDATE)
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(updateUserValidationSchema))
    updateUserRequest: UpdateUserRequest
  ): Promise<UserDto> {
    const updatedUser = await this.service.updateWithRelations(id, updateUserRequest);

    return updatedUser;
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Record not found',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Delete(':id')
  @RoutePermissions(AvalilableCollections.USER, CrudActions.DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.deleteOne(id);
  }

  @ApiOperation({ summary: 'Find all users by filters using pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Found records.',
    type: UserPaginatedResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, The response body may contain clues as to what went wrong',
  })
  @ApiFilterQuery([
    {
      name: 'filters[search]',
      filter: FilterStringApiProperty,
    },
    {
      name: 'filters[email]',
      filter: 'string',
    },
  ])
  @Get()
  @RoutePermissions(AvalilableCollections.USER, CrudActions.LIST)
  async paginated(
    @Query() pagination: PaginatedQuery,
    @Query('filters') filters: FilterUserDto = {}
  ): Promise<UserPaginatedResponse> {
    const paginated = await this.paginatedService.getData(filters, pagination);

    return new UserPaginatedResponse(paginated);
  }
}
