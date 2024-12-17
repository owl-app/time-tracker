import { TypeMapper } from 'ts-mapper';

import { ClientResponse } from './dto/client.response';
import { ClientEntity } from '../domain/entity/client.entity';

export class MapperClient extends TypeMapper {
  constructor() {
    super();
    this.config();
  }

  private config(): void {
    this.createMap<ClientEntity, ClientResponse>()
      .map(
        (src) => src.id,
        (dest) => dest.id
      )
      .map(
        (src) => src.name,
        (dest) => dest.name
      );
  }
}

const mapperClient = new MapperClient();

export { mapperClient };
