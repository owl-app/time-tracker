import { cloneDeep, set } from 'lodash';

import api from '../services/api';

export const fetchAll = async <T = unknown>(
  url: Parameters<(typeof api)['get']>[0],
  config: Parameters<(typeof api)['get']>[1] = {},
  limit = Infinity
): Promise<T[]> => {
  let page = 1;
  let hasMore = true;

  const pageSize = 10;
  const result = [] as T[];

  const requests = [];
  while (result.length < limit && hasMore === true) {
    const configWithPagination = cloneDeep(config);
    set(configWithPagination, 'params.page', page);
    set(configWithPagination, 'params.limit', pageSize);

    requests.push(api.get(url, configWithPagination));
    page += 1;
  }

  const responses = await Promise.all(requests);

  responses.forEach((response) => {
    const { data } = response;
    if (data.data.length === 0) {
      hasMore = false;
    } else {
      result.push(...data.data);
    }
  });

  if (Number.isFinite(limit)) {
    return result.slice(0, limit);
  }

  return result;
};
