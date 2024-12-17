import { Component } from 'vue';

export interface LayoutContext {
  emit: (
    event: 'update:selection' | 'update:layoutOptions' | 'update:layoutQuery',
    ...args: any[]
  ) => void;
}

export interface LayoutProps<Options = any, Query = any> {
  collection: string | null;
  selection: (number | string)[];
  layoutOptions: Options;
  layoutQuery: Query;
  layoutProps: Record<string, unknown>;
  search: string | null;
  selectMode: boolean;
  readonly: boolean;
  resetPreset?: () => Promise<void>;
  clearFilters?: () => void;
}

export interface LayoutConfig<Options = any, Query = any> {
  id: string;
  name: string;
  icon: string;
  component: Component;
  slots: {
    options: Component;
    sidebar: Component;
    actions: Component;
  };
  smallHeader?: boolean;
  headerShadow?: boolean;
  sidebarShadow?: boolean;
  setup: (props: LayoutProps<Options, Query>, ctx: LayoutContext) => Record<string, unknown>;
}
