/* eslint-disable import/export */
export {
  AbstractAssembler,
  Assembler,
  AssemblerDeserializer,
  AssemblerFactory,
  AssemblerSerializer,
  ClassTransformerAssembler,
  DefaultAssembler,
} from './lib/assemblers';
export * from './lib/common';
export {
  getQueryServiceToken,
  getAssemblerQueryServiceToken,
  InjectAssemblerQueryService,
  InjectQueryService,
} from './lib/decorators';
export {
  applyFilter,
  applyPaging,
  applyQuery,
  applySort,
  getFilterComparisons,
  getFilterFields,
  getFilterOmitting,
  invertSort,
  mergeFilter,
  mergeQuery,
  type QueryFieldMap,
  transformAggregateQuery,
  transformAggregateResponse,
  transformFilter,
  transformQuery,
  transformSort,
} from './lib/helpers';
export * from './lib/interfaces';
export { NestjsQueryCoreModule } from './lib/module';
export type { NestjsQueryCoreModuleOpts, NestjsQueryCoreModuleAssemblersOpts } from './lib/types';
export {
  AssemblerQueryService,
  NoOpQueryService,
  ProxyQueryService,
  QueryService,
  type QueryServiceRelation,
  RelationQueryService,
} from './lib/services';
