import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionResponse {
  @ApiProperty({ type: String, isArray: true })
  readonly routes: readonly string[];

  @ApiProperty({ type: String, isArray: true })
  readonly fields: readonly string[];

  constructor(routes: string[], fields: string[]) {
    this.routes = routes;
    this.fields = fields;
  }
}
