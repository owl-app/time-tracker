import { Ref } from 'vue';

import type { LayoutConfig } from './layout.js';
import type { ModuleConfig } from './module.js';

export type ApplicationRegistry = Map<'layouts' | 'modules', Ref<ModuleConfig[] | LayoutConfig[]>>;
