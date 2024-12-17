import { createApp } from 'vue';
import { createVuestic } from 'vuestic-ui';
import { createPinia } from 'pinia';

import bootstrap from '@owl-app/lib-app-core/application/bootstrap';
import { i18n } from '@owl-app/lib-app-core/application/lang';
import { createApplicationConfig } from '@owl-app/lib-app-core/application/config.factory';

import AuthModule from '@owl-app/lib-app-module-auth';
import UserModule from '@owl-app/lib-app-module-user';
import ClientModule from '@owl-app/lib-app-module-client';
import RbacModule from '@owl-app/lib-app-module-rbac';
import TagModule from '@owl-app/lib-app-module-tag';
import TimeTrackerModule from '@owl-app/lib-app-module-time-tracker';
import ProjectModule from '@owl-app/lib-app-module-project';

import App from './app.vue';
import vuesticGlobalConfig from './config/vuestic-ui/global-config';

initApp();

async function initApp() {
  console.info(`%c Starting...`, 'color:Green');

  console.time('🕓 Application Loaded');

  const app = createApp(App);

  app.use(i18n);
  app.use(createPinia());
  app.use(createVuestic({ config: vuesticGlobalConfig }));

  await bootstrap(
    app,
    createApplicationConfig(
      [
        AuthModule,
        UserModule,
        ClientModule,
        RbacModule,
        TimeTrackerModule,
        TagModule,
        ProjectModule,
      ],
      [],
      {
        request: [],
      }
    )
  );

  app.mount('#app');

  console.timeEnd('🕓 Application Loaded');

  console.info(`%cEnvironment: ${import.meta.env.MODE}`, 'color:DodgerBlue');
}
