import { Assembler, ClassTransformerAssembler } from '@owl-app/nestjs-query-core';

import { ProjectEntity } from '../../../../domain/entity/project.entity';

import { ProjectResponse } from '../../../dto/project.response';

@Assembler(ProjectResponse, ProjectEntity)
export class ProjectAssembler extends ClassTransformerAssembler<ProjectResponse, ProjectEntity> {}
