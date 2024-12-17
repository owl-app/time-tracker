import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { TagEntity } from '../../../../domain/entity/tag.entity';

import { TagResponse } from '../../../dto/tag.response';

@Assembler(TagResponse, TagEntity)
export class TagAssembler extends ClassTransformerAssembler<TagResponse, TagEntity> {}
