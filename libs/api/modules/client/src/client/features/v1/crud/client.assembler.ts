import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { ClientEntity } from '../../../../domain/entity/client.entity';

import { ClientResponse } from '../../../dto/client.response';

@Assembler(ClientResponse, ClientEntity)
export class ClientAssembler extends ClassTransformerAssembler<ClientResponse, ClientEntity> {}
