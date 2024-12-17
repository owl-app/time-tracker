import { bootstrap } from './bootstrap';

import { BootstrapModule } from './app/bootstrap.module';

bootstrap(BootstrapModule).catch(() => {
  process.exit(1);
});
