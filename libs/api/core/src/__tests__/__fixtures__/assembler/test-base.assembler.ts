import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { TestBaseEntity } from '../test-base.entity';
import { TestBaseResponse } from '../dto/test-base.response';

@Assembler(TestBaseResponse, TestBaseEntity)
export class TestBaseAssembler extends ClassTransformerAssembler<
  TestBaseResponse,
  TestBaseEntity
> {}
