import { registerAs } from '@nestjs/config';

export const QUERY_CONFIG_NAME = 'query';

type PaginationConfigQuery = {
  default_limit: number;
};

export interface IConfigQuery {
  pagination: PaginationConfigQuery;
}

export default registerAs(
  QUERY_CONFIG_NAME,
  (): IConfigQuery => ({
    pagination: {
      default_limit: 10,
    },
  })
);
