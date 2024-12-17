import { defineModule } from '@owl-app/lib-app-core/application/defines/module';

import TimeListRoute from './routes/time-list.vue';

export default defineModule({
  id: 'time-tracker',
  name: '$t:time_tracker_module',
  icon: 'timer',
  routes: {
    private: [
      {
        name: 'time-list',
        path: 'times',
        component: TimeListRoute,
        meta: {
          private: true,
        },
      },
    ],
  },
});
