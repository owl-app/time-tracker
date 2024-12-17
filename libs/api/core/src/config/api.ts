import { registerAs } from '@nestjs/config';

export const APP_CONFIG_NAME = 'app';

type QueryConfig = {
  default_limit: number;
};

export interface IConfigApp {
  prefix: string;
  version: string;
  app_name: string;
  host: string;
  port: number;
  passwordBcryptSaltRounds: number;
  query: QueryConfig;
}

export default registerAs(
  APP_CONFIG_NAME,
  (): IConfigApp => ({
    prefix: process.env.APP_API_PREFIX || 'api',
    version: process.env.APP_API_VERSION,
    app_name: process.env.APP_NAME,
    host: process.env.API_HOST || 'localhost',
    port: parseInt(process.env.API_PORT, 10) || 3000,
    query: {
      default_limit: 10,
    },
    passwordBcryptSaltRounds: parseInt(process.env.PASSWORD_BCRYPT_SALT_ROUNDS, 10) || 12,
  })
);
