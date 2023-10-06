import { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { PaginatedResponse } from '~~/types/Laravel';

const fetchAllPaginatedResults = async <T>(
  axios: AxiosInstance,
  url: string,
  params: AxiosRequestConfig = {}
): Promise<T[]> => {
  const results: T[] = [];
  let [page, hasNextPage] = [1, true];

  while (hasNextPage) {
    const response = await axios.get<PaginatedResponse<T>>(url, {
      params: { ...params, page },
    });

    results.push(...response.data.data);

    hasNextPage = !!response.data.links.next;
    page++;
  }

  return results;
};

export { fetchAllPaginatedResults };
