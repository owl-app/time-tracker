import { DateTime } from 'luxon';
import { debounce } from 'lodash';

import { Project, Tag, Time } from '@owl-app/lib-contracts';

import { defineStore } from 'pinia';
import api from '../services/api';

export const useTimeStore = defineStore({
  id: 'timeStore',
  state: () => ({
    active: null as Time | null,
    loading: false,
    intervalTimer: null as ReturnType<typeof setInterval> | null,
    timer: '00:00:00',
  }),
  actions: {
    async hydrate() {
      this.loading = true;

      try {
        this.stopInterval();

        const { data } = await api.get(`/times/in-progress`);

        if (data) {
          this.active = data;
          this.startInterval();
        } else {
          this.active = null;
        }
      } finally {
        debounce(() => {
          this.loading = false;
        }, 500)();
      }
    },
    async dehydrate() {
      this.$reset();
    },
    async startTimer(description: string, project: Project, tags: Tag[]) {
      try {
        this.startInterval();

        const { data } = await api.post('/times/stopwatch', {
          description,
          project,
          tags,
        });

        this.active = data;
      } catch (error: any) {
        this.stopInterval();
        throw error;
      }
    },

    async continueTimer(id: string) {
      const { data } = await api.post(`/times/stopwatch/${id}`);

      this.active = data;

      this.startInterval();
    },

    async stopTimer(description: string, project: Project, tags: Tag[]) {
      const { data } = await api.put('/times/stopwatch', {
        description,
        project,
        tags,
      });

      this.active = null;
      this.stopInterval();

      return data;
    },

    startInterval() {
      const startTime = DateTime.fromJSDate(new Date(this.active?.timeIntervalStart || new Date()));

      this.timer = DateTime.now()
        .diff(startTime, ['hours', 'minutes', 'seconds'])
        .toFormat('hh:mm:ss');

      this.intervalTimer = setInterval(() => {
        const now = DateTime.now();

        this.timer = now.diff(startTime, ['hours', 'minutes', 'seconds']).toFormat('hh:mm:ss');
      }, 1000);
    },

    stopInterval() {
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
        this.timer = '00:00:00';
      }
    },
  },
});
