import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { EntitySchema } from 'typeorm';

export function getPaginatedQueryServiceToken(DTOClass: EntityClassOrSchema): string {
  if (DTOClass instanceof EntitySchema) {
    if (DTOClass.options.target) {
      return `${DTOClass.options.target.name}PaginatedQueryService`;
    }

    return `${DTOClass.options.name}PaginatedQueryService`;
  }

  if (DTOClass.name === '') {
    throw new Error('Anonymous class is not supported');
  }

  return `${DTOClass.name}PaginatedQueryService`;
}
