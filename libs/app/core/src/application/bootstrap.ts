import { App, shallowRef, watch } from 'vue';

import { i18n } from './lang/index';
import { registerModules } from './registers/module';
import { translate } from './lang/translate-object-values';
import { registerComponents } from './registers/components';
import { registerDirectives } from './registers/directives';
import { registerLayouts } from './registers/layouts';
import { router } from './router';
import { useAppRegistry } from './registry';
import { registerEvents } from './registers/events';
import { defineModuleRequestEvent } from './events/initialize-modules-event';
import { ApplicationConfig } from './types/config';

export default async function bootstrap(app: App, config: ApplicationConfig) {
  const appRegistry = useAppRegistry();

  registerDirectives(app);
  registerComponents(app);
  registerLayouts(app);

  const registeredModules = registerModules(config.modules);

  config.events.request = [
    ...defineModuleRequestEvent(registeredModules, config.modules),
    ...(config.events.request ?? []),
  ];

  watch(
    [i18n.global.locale, registeredModules],
    () => {
      appRegistry.set('modules', shallowRef(translate(registeredModules.value)));
    },
    { immediate: true }
  );

  registerEvents(app, config.events);

  // Add router after loading application to ensure all routes are registered
  app.use(router);
}
