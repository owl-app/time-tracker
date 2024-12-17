import { App, defineAsyncComponent } from 'vue';
import { AuthLayout } from '../../layouts/auth';

const PanelLayout = defineAsyncComponent(() => import('../../layouts/panel'));

export function registerLayouts(app: App): void {
  app.component('AuthLayout', AuthLayout);
  app.component('PanelLayout', PanelLayout);
}
