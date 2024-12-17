export interface AppConfig {
  api: {
    baseUrl: string;
    prefix: string;
    tokenClockTolerance: number;
  };
}

export const Config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prefix: import.meta.env.VITE_API_PREFIX,
    tokenClockTolerance: parseInt(import.meta.env.TOKEN_CLOCK_TOLERANCE, 10) || 2000,
  },
};
