import { ModuleConfig } from './types/module';
import { LayoutConfig } from './types/layout';
import { ApplicationLifecycleEvents } from './types/lifecycle';
import { ApplicationConfig } from './types/config';

export function createApplicationConfig(
  modules: ModuleConfig[],
  layouts: LayoutConfig[],
  events: ApplicationLifecycleEvents
): ApplicationConfig {
  return {
    modules,
    layouts,
    events,
  };
}
