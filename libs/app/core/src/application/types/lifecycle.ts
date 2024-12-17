import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

import { LIFECYCLE_EVENTS } from '../contants';

export interface ApplicationLifecycleEvents {
  request: RequestEvent[];
}

export type LifecycleEvent<Event, Callback> = {
  name: string;
  priority: number;
  event: Event;
  callback: Callback;
};

export type RequestEventCallbackType = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next?: NavigationGuardNext
) => Promise<void | string>;

export type RequestEventType =
  | typeof LIFECYCLE_EVENTS.REQUEST.ON_AFTER_EACH
  | typeof LIFECYCLE_EVENTS.REQUEST.ON_BEFORE_EACH;

export type RequestEvent = LifecycleEvent<RequestEventType, RequestEventCallbackType>;
