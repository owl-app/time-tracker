import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionResponse {
  @ApiProperty({ type: String, isArray: true })
  readonly routes: readonly string[];

  @ApiProperty({ type: String, isArray: true })
  readonly fileds: readonly string[];

  constructor(routes: string[], fileds: string[]) {
    this.routes = routes;
    this.fileds = fileds;
  }
}
