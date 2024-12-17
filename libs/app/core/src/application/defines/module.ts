import { ModuleConfig } from '../types/module';

export function defineModule<T extends ModuleConfig>(config: T): T {
  return config;
}
