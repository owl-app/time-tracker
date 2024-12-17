import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EntitySchema } from 'typeorm';

export function getPaginatedQueryServiceToken(DTOClass: EntityClassOrSchema): string {
  if (DTOClass instanceof EntitySchema) {
    if (DTOClass.options.target) {
      return `${DTOClass.options.target.name}PaginatedQueryService`;
    }

    return `${DTOClass.options.name}PaginatedQueryService`;
  }

  return `${DTOClass.name}PaginatedQueryService`;
}
