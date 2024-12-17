import { defineStore } from 'pinia';
import type { RouteLocationRaw } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';

import { User } from '@owl-app/lib-contracts';

import { userName } from '../utils/user-name';
import api from '../services/api';
import { router } from '../application/router';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    authenticated: false as boolean,
    accessTokenExpiry: useLocalStorage<number>('accessTokenExpiry', 0),
    refreshTokenExpiry: useLocalStorage<number>('refreshTokenExpiry', 0),
    currentUser: null as User | null,
    loading: false,
    error: null,
    isRefreshing: false,
  }),
  getters: {
    fullName(): string | null {
      if (this.currentUser === null || 'share' in this.currentUser) return null;
      return userName(this.currentUser);
    },
    isAdmin(): boolean {
      return true;
      // return this.currentUser?.role?.admin_access === true || false;
    },
    isPublic(): boolean {
      return true;
    },
  },
  actions: {
    async hydrate() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get(`/user/me`);

        this.currentUser = data.user;
      } catch (error: any) {
        this.error = error;
        this.accessTokenExpiry = 0;
      } finally {
        this.loading = false;
      }
    },
    async dehydrate() {
      this.$reset();
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post(
          '/auth/login',
          { email, password },
          { isAuthenticated: false }
        );

        this.logged(data.accessTokenExpires, data.refreshTokenExpires);
      } catch (error: any) {
        throw error.response?.data?.message ?? error.message;
      } finally {
        this.loading = false;
      }
    },
    async logout(withRequest = true) {
      this.loading = true;
      this.error = null;

      try {
        if (withRequest) {
          await api.post('/auth/logout');
        }
      } catch (error: any) {
        this.error = error.response.data.message;
      } finally {
        this.loading = false;
        this.authenticated = false;
        this.currentUser = null;
        this.accessTokenExpiry = 0;
        this.refreshTokenExpiry = 0;

        const location: RouteLocationRaw = {
          path: `/login`,
        };

        setTimeout(() => {
          router.push(location);
        }, 500);
      }
    },
    async refresh() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.post('/auth/refresh');

        this.logged(data.accessTokenExpires, data.refreshTokenExpires);
      } catch (error: any) {
        this.error = error?.response.data.message;
      } finally {
        this.loading = false;
      }
    },
    logged(accessTokenExpires = null, refreshTokenExpires = null) {
      this.authenticated = true;
      this.accessTokenExpiry = Date.now() + (accessTokenExpires ?? 0);
      this.refreshTokenExpiry = Date.now() + (refreshTokenExpires ?? 0);
    },
    async register(email: string, passwordNew: string, passwordNewRepeat: string) {
      this.loading = true;
      this.error = null;

      try {
        await api.post(
          '/registration',
          { email, passwordNew, passwordNewRepeat },
          { isAuthenticated: false }
        );
      } catch (error: any) {
        throw error.response?.data?.message ?? error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
