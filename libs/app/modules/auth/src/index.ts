import { defineModule } from '@owl-app/lib-app-core/application/defines/module';

import LoginRoute from './features/login/login.vue';
import LogoutRoute from './features/logout/logout.vue';
import RecoveryPasswordRoute from './features/recovery-password/recovery-password.vue';
import RegisterRoute from './features/register/register.vue';

export default defineModule({
  id: 'auth',
  name: '$t:auth_module',
  icon: 'people_alt',
  routes: {
    public: [
      {
        name: 'login',
        path: 'login',
        component: LoginRoute,
        props: (route) => ({
          ssoErrorCode: route.query.error ? route.query.code : null,
          logoutReason: route.query.reason,
        }),
        meta: {
          public: true,
        },
      },
      {
        name: 'logout',
        path: 'logout',
        component: LogoutRoute,
        meta: {
          private: true,
        },
      },
      {
        name: 'recovery-password',
        path: 'recovery-password',
        component: RecoveryPasswordRoute,
        meta: {
          public: true,
        },
      },
      {
        name: 'register',
        path: 'register',
        component: RegisterRoute,
        meta: {
          public: true,
        },
      },
    ],
  },
});
