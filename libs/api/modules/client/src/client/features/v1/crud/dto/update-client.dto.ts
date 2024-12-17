import { PartialType } from '@nestjs/swagger';

import { CreateClientRequest } from './create-client.request';

export class UpdateClientDto extends PartialType(CreateClientRequest) {}
