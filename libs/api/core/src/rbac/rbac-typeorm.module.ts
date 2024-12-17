import { DynamicModule, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Rule } from '@owl-app/rbac-manager';
import { rbacManagerFactoryProvider } from '@owl-app/rbac-storage-typerom';
import { RegistryServiceModule } from '@owl-app/registry-nestjs';
import { ExtendedItemFactory } from './item.factory';

export class RbacTypeOrmModule {
  static forFeature(rules?: Record<string, Type<Rule>>): DynamicModule {
    return {
      module: RbacTypeOrmModule,
      imports: [
        TypeOrmModule,
        ConfigModule,
        RegistryServiceModule.forFeature<Rule>({
          name: 'SERVICE_REGISTRY_RULES_NAME',
          services: rules,
        }),
      ],
      providers: [
        rbacManagerFactoryProvider,
        {
          provide: 'ITEM_STORAGE_ITEM_FACTORY',
          useFactory: () => new ExtendedItemFactory(),
        },
      ],
      exports: [rbacManagerFactoryProvider],
    };
  }
}
