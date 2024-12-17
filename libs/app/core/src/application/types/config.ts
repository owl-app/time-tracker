import type { LayoutConfig } from './layout.js';
import type { ModuleConfig } from './module.js';
import type { ApplicationLifecycleEvents } from './lifecycle.js';

export interface ApplicationConfig {
  /**
   * List of layouts that should be available in the application.
   */
  layouts: LayoutConfig[];
  /**
   * List of modules that should be available in the application.
   */
  modules: ModuleConfig[];
  /**
   * List of events that should be available in the application.
   */
  events: ApplicationLifecycleEvents;
}
