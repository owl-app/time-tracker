import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProjectRequest } from './create-project.request';

export class UpdateProjectRequest extends PartialType(CreateProjectRequest) {
  @ApiProperty({ type: () => String })
  color: string;
}
