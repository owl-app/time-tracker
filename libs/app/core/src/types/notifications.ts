export type Notification = {
  id: string;
  status: string;
  timestamp: string;
  recipient: string;
  sender: string | null;
  subject: string;
  message: string | null;
  collection: string | null;
};

export interface SnackbarRaw {
  id?: string;
  persist?: boolean;
  title: string;
  text?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  code?: string;
  icon?: string | null;
  closeable?: boolean;
  progress?: number;
  loading?: boolean;
  dialog?: boolean;
  error?: Error;
  alwaysShowText?: boolean;
  dismissIcon?: string;
  dismissText?: string;
  dismissAction?: () => void | Promise<void>;
}

export interface Snackbar extends SnackbarRaw {
  readonly id: string;
  readonly timestamp: number;
}
