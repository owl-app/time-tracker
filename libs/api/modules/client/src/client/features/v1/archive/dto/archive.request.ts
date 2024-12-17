import { ApiPropertyOptional } from '@nestjs/swagger';

import ArchiveRequest from '@owl-app/lib-api-core/actions/archive/archive.request';

export default class ClientArchiveRequest extends ArchiveRequest {
  @ApiPropertyOptional({ required: false, default: false })
  withProjects?: boolean;
}
