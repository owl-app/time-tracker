import { registerAs } from '@nestjs/config';

export const QUERY_CONFIG_NAME = 'query';

type PaginationConfigQuery = {
  default_limit: number;
};

export interface ConfigQuery {
  pagination: PaginationConfigQuery;
}

export default registerAs(
  QUERY_CONFIG_NAME,
  (): ConfigQuery => ({
    pagination: {
      default_limit: 10,
    },
  })
);
