import { Filter } from './filter.interface';
import { WithDeleted } from './with-deleted.interface';

export interface UpdateOneOptions<DTO> extends WithDeleted {
  /**
   * Additional filter to use when updating an entity by id. This could be used to apply an additional filter to ensure
   * that the entity belongs to a particular user.
   */
  filter?: Filter<DTO>;
}
