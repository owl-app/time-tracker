import { App } from 'vue';

import { useAppLifecycleEventRegistry } from '../registry';
import InitializeStoresEvent from '../events/initialize-stores-event';
import InitializeLangEvent from '../events/initialize-lang-event';
import ProvideCommonEvent from '../events/provide-common-event';
import RedirectEvent from '../events/redirect-event';
import { ApplicationLifecycleEvents } from '../types/lifecycle';

import InitializeAuthenticationEvent from '../events/auth-user-event';
import HydrateUserEvent from '../events/hydrate-user-event';

export function registerEvents(app: App, customEvents: ApplicationLifecycleEvents): void {
  const appLifecycleRegistry = useAppLifecycleEventRegistry();

  appLifecycleRegistry.request.push(InitializeAuthenticationEvent);
  appLifecycleRegistry.request.push(HydrateUserEvent);
  appLifecycleRegistry.request.push(InitializeStoresEvent);
  appLifecycleRegistry.request.push(InitializeLangEvent);
  appLifecycleRegistry.request.push(ProvideCommonEvent(app));
  appLifecycleRegistry.request.push(RedirectEvent);

  appLifecycleRegistry.request.push(...customEvents.request);
}
