import {
  Controller,
  HttpStatus,
  Body,
  Param,
  HttpCode,
  Injectable,
  Patch,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiAcceptedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  AvalilableCollections,
  CommonActions,
  archiveValidationSchema,
} from '@owl-app/lib-contracts';

import ArchiveRequest from '@owl-app/lib-api-core/actions/archive/archive.request';
import { ArchiveService } from '@owl-app/lib-api-core/actions/archive/archive.service';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';

import { ProjectResponse } from '../../../dto/project.response';

@ApiTags('Projects')
@Controller('projects')
@ApiBearerAuth()
@Injectable()
export class ArchiveControllerController {
  constructor(
    @Inject(ArchiveService)
    private readonly archiveService: ArchiveService
  ) {}

  @ApiOperation({ summary: 'Archive tag' })
  @ApiAcceptedResponse({
    description: 'Project has been successfully archived.',
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
  @Patch('archive/:id')
  @RoutePermissions(AvalilableCollections.PROJECT, CommonActions.ARCHIVE)
  async archive(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(archiveValidationSchema)) archiveClientRequest: ArchiveRequest
  ): Promise<void> {
    await this.archiveService.execute(id, archiveClientRequest);
  }
}
