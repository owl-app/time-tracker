import {
  Controller,
  HttpStatus,
  Body,
  Param,
  HttpCode,
  Injectable,
  Patch,
  Inject,
  NotFoundException as NotFoundHttpException,
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
  clientArchiveValidationSchema,
} from '@owl-app/lib-contracts';

import { ArchiveService } from '@owl-app/lib-api-core/actions/archive/archive.service';
import { UUIDValidationPipe } from '@owl-app/lib-api-core/pipes/uuid-validation.pipe';
import { RoutePermissions } from '@owl-app/lib-api-core/rbac/decorators/route-permission';
import { ValibotValidationPipe } from '@owl-app/lib-api-core/validation/valibot.pipe';
import { NotFoundException } from '@owl-app/lib-api-core/exceptions/exceptions';

import { ClientResponse } from '../../../dto/client.response';
import ClientArchiveRequest from './dto/archive.request';

@ApiTags('Client')
@Controller('clients')
@ApiBearerAuth()
@Injectable()
export class ArchiveControllerController {
  constructor(
    @Inject(ArchiveService)
    private readonly archiveService: ArchiveService
  ) {}

  @ApiOperation({ summary: 'Archive client' })
  @ApiAcceptedResponse({
    description: 'Client has been successfully archived.',
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
  @Patch('archive/:id')
  @RoutePermissions(AvalilableCollections.CLIENT, CommonActions.ARCHIVE)
  async archive(
    @Param('id', UUIDValidationPipe) id: string,
    @Body(new ValibotValidationPipe(clientArchiveValidationSchema))
    archiveClientRequest: ClientArchiveRequest
  ): Promise<void> {
    try {
      await this.archiveService.execute(id, archiveClientRequest);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new NotFoundHttpException(error.message);
      }
    }

  }
}
