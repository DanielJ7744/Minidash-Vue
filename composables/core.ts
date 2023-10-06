import { http } from '@/lib/http';
import type { Company } from '@/types/fabric/v2';

type CoreApiVersion = 1 | 2;
type CoreDomain = 'core' | 'secrets' | 'initialise';
type FetchParams = Parameters<typeof $fetch>[1];
type RouteSegment = string | number;
type RoutePath = string | [RouteSegment, RouteSegment, ...RouteSegment[]];

const proxies: { [domain in CoreDomain]: string } = {
  core: '/core-main',
  secrets: '/core-secrets',
  initialise: '/core-initialise',
};

const landlord = <T>(
  domain: CoreDomain,
  version: CoreApiVersion,
  uri: string,
  options: FetchParams
) => {
  const url = prepareUrl([
    proxies[domain],
    'api',
    `v${version}`,
    'patchworks',
    uri,
  ]);

  return http<T>(url, options);
};

const tenant = <T>(
  domain: CoreDomain,
  version: CoreApiVersion,
  uri: string,
  options: FetchParams = {},
  tenantId?: Company['id']
) => {
  if (tenantId) {
    options.headers = {
      ...(options.headers || {}),
      'patchworks-tenant': tenantId.toString(),
    };
  }

  const url = prepareUrl([proxies[domain], 'api', `v${version}`, uri]);

  return http<T>(url, options);
};

const raw = <T>(domain: CoreDomain, uri: string, options: FetchParams) => {
  const url = prepareUrl([proxies[domain], uri]);

  return http<T>(url, options);
};

const prepareUrl = (parts: (string | number)[]) =>
  parts.join('/').replace('//', '/');

const core = <T>(
  domain: CoreDomain,
  version: CoreApiVersion = 1,
  path: RoutePath,
  options: FetchParams = {}
) => {
  const uri: string = Array.isArray(path) ? path.join('/') : path;

  return {
    version: (version: CoreApiVersion) =>
      core<T>(domain, version, path, options),
    landlord: () => landlord<T>(domain, version, uri, options),
    tenant: (id?: Company['id']) =>
      tenant<T>(domain, version, uri, options, id),
  };
};

export const useCore = () => ({
  core: <T>(path: RoutePath, options?: FetchParams) =>
    core<T>('core', 1, path, options),
  secrets: <T>(path: RoutePath, options?: FetchParams) =>
    core<T>('secrets', 1, path, options),
  initialise: <T>(path: RoutePath, options?: FetchParams) =>
    core<T>('initialise', 1, path, options),
  raw: <T>(path: string, options?: FetchParams) =>
    raw<T>('core', path, options),
});
