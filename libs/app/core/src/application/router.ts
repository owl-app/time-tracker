import { orderBy } from 'lodash';
import qs from 'qs';
import { createRouter, createWebHistory, NavigationGuard, NavigationHookAfter } from 'vue-router';
import type { LocationQuery, RouteRecordRaw } from 'vue-router';

import { getRootPath } from '../utils/get-root-path';
import PrivateNotFound from '../pages/private-not-found.vue';

import { useAppLifecycleEventRegistry } from './registry';
import { LIFECYCLE_EVENTS } from './contants';

export const defaultRoutes: RouteRecordRaw[] = [
  {
    name: 'private-404',
    path: '/:_(.+)+',
    component: PrivateNotFound,
  },
];

export const router = createRouter({
  history: createWebHistory(`${getRootPath()}admin/`),
  routes: defaultRoutes,
  parseQuery(search: string): LocationQuery {
    return qs.parse(search) as LocationQuery;
  },
  stringifyQuery: qs.stringify,
});

export const onBeforeEach: NavigationGuard = async (to, from) => {
  const appLifecycleEventRegistry = useAppLifecycleEventRegistry();
  let result = null;

  const events = await orderBy(appLifecycleEventRegistry.request, ['priority'], 'desc').filter(
    ({ event }) => event === LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH
  );

  for (const event of events) {
    // eslint-disable-next-line no-await-in-loop
    result = await event.callback(to, from);

    if (result) {
      return result;
    }
  }

  return undefined;
};

export const onAfterEach: NavigationHookAfter = async (to, from) => {
  const appLifecycleEventRegistry = useAppLifecycleEventRegistry();
  let result = null;

  await orderBy(appLifecycleEventRegistry.request, ['priority'], 'desc')
    .filter(({ event }) => event === LIFECYCLE_EVENTS.REQUEST.ON_AFTER_EACH)
    .reduce(async (prviousEvent, event) => {
      await prviousEvent;
      result = await event.callback(to, from);
    }, Promise.resolve());

  if (result) {
    return result;
  }

  return undefined;
};

router.beforeEach(onBeforeEach);
router.afterEach(onAfterEach);
