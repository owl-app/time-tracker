import { DataSource } from 'typeorm';
import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Rule, RbacManager } from '@owl-app/rbac-manager';
import { Registry } from '@owl-app/registry';

import { IRbacConfig, RBAC_CONFIG_NAME } from './config.interface';
import { TypeOrmItemsStorage } from './items-storage';
import { TypeOrmAssignmentsStorage } from './assigments-storage';
import { ItemFactory } from './item.factory';
import { RawItem } from './types';

export const createItemStorageProvider: FactoryProvider = {
  provide: 'RBAC_ITEM_STORAGE',
  useFactory(
    dataSource: DataSource,
    configService: ConfigService,
    itemFactory: ItemFactory<RawItem>
  ) {
    const { itemTableName = 'rbac_item', itemChildrenTableName = null } =
      configService.get<IRbacConfig>(RBAC_CONFIG_NAME) ?? {};

    return new TypeOrmItemsStorage(dataSource, itemTableName, itemFactory, itemChildrenTableName);
  },
  inject: [DataSource, ConfigService, 'ITEM_STORAGE_ITEM_FACTORY'],
};

export const createAssigmentsStorageProvider: FactoryProvider = {
  provide: 'RBAC_ASSIGMENTS_STORAGE',
  useFactory(dataSource: DataSource, configService: ConfigService) {
    const { assigmentsTable = 'rbac_assigments' } =
      configService.get<IRbacConfig>(RBAC_CONFIG_NAME) ?? {};

    return new TypeOrmAssignmentsStorage(dataSource, assigmentsTable);
  },
  inject: [DataSource, ConfigService],
};

export const rbacManagerFactoryProvider: FactoryProvider = {
  provide: 'RBAC_MANAGER',
  useFactory: (
    dataSource: DataSource,
    configService: ConfigService,
    serviceRegistryRules: Registry<Rule>,
    itemFactory: ItemFactory<RawItem>
  ) => {
    const {
      itemTableName = 'rbac_item',
      itemChildrenTableName = null,
      assigmentsTable = 'rbac_assigment',
    } = configService.get<IRbacConfig>(RBAC_CONFIG_NAME) ?? {};
    const itemsStorage = new TypeOrmItemsStorage(
      dataSource,
      itemTableName,
      itemFactory,
      itemChildrenTableName
    );
    const assigmentsStorage = new TypeOrmAssignmentsStorage(dataSource, assigmentsTable);

    return new RbacManager(itemsStorage, assigmentsStorage, serviceRegistryRules);
  },
  inject: [DataSource, ConfigService, 'SERVICE_REGISTRY_RULES_NAME', 'ITEM_STORAGE_ITEM_FACTORY'],
};
