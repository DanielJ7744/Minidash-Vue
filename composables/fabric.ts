import { http, isNitro } from '@/lib/http';

export const useFabric = async <T>(
  url: string,
  options: Parameters<typeof $fetch>[1] = {}
) => {
  const base = isNitro() ? process?.env?.FABRIC_URL : '/fabric';

  return http<T>(`${base || '/fabric'}${url}`, options);
};
