import Joi from 'joi';
import { ConfigService, registerAs } from '@nestjs/config';
import JoiUtil, { JoiConfig } from '../utils/joi-config';

export const PAGINATION_CONFIG_NAME = 'pagination';

export const PAGINATION_CONFIG_PROVIDER = 'PaginationConfig';

export interface PaginationConfig {
  perPage: number;
  availablePerPage: [number];
}

export const PaginationConfigProvider = {
  inject: [ConfigService],
  provide: PAGINATION_CONFIG_PROVIDER,
  useFactory: (config: ConfigService): PaginationConfig =>
    config.get<PaginationConfig>(PAGINATION_CONFIG_NAME),
};

export default registerAs(PAGINATION_CONFIG_NAME, (): PaginationConfig => {
  const configs: JoiConfig<PaginationConfig> = {
    perPage: {
      value: process.env.PAGINATION_PER_PAGE || 10,
      joi: Joi.number().description('Items per page'),
    },
    availablePerPage: {
      value: process.env.PAGINATION_AVAILABLE_PER_PAGE || [10, 50, 100],
      joi: Joi.array()
        .optional()
        .empty(Joi.array().length(0))
        .description('Available options items per page'),
    },
  };

  return JoiUtil.validate(configs);
});
