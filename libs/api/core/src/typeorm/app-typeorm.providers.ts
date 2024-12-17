import { DataSource, DataSourceOptions, getMetadataArgsStorage } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Provider } from '@nestjs/common';

import { AppTypeOrmEntitesOpts } from './types';
import { getRepositoryToken } from './common/typeorm.utils';

export function createAppTypeOrmProviders(
  entities?: AppTypeOrmEntitesOpts[],
  dataSource?: DataSource | DataSourceOptions | string
): Provider[] {
  return (entities || []).map(
    ({ entity, repository: Repository = null, inject = null, repositoryToken = null }) => ({
      provide: repositoryToken ?? getRepositoryToken(entity, dataSource),
      useFactory: (ds: DataSource, ...injectArgs) => {
        const entityMetadata = ds.entityMetadatas.find((meta) => meta.target === entity);
        const isTreeEntity = typeof entityMetadata?.treeType !== 'undefined';

        let baseRepo;
        if (isTreeEntity) {
          baseRepo = ds.getTreeRepository(entity);
        } else if (ds.options.type === 'mongodb') {
          baseRepo = ds.getMongoRepository(entity);
        } else {
          baseRepo = ds.getRepository(entity);
        }

        if (Repository !== null) {
          return new Repository(
            baseRepo.target,
            baseRepo.manager,
            baseRepo.queryRunner,
            ...injectArgs
          );
        }

        return baseRepo;
      },
      inject: [getDataSourceToken(dataSource), ...(inject ?? [])],
      /**
       * Extra property to workaround dynamic modules serialisation issue
       * that occurs when "TypeOrm#forFeature()" method is called with the same number
       * of arguments and all entities share the same class names.
       */
      targetEntitySchema: getMetadataArgsStorage().tables.find((item) => item.target === entity),
    })
  );
}
