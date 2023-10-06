export const http = async <T>(
  url: string,
  options: Parameters<typeof $fetch>[1] = {}
) => {
  const authStore = useAuthStore();

  options = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
  };

  return $fetch<T>(url, {
    ...options,
    onRequest({ options }) {
      if (authStore.token) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: 'Bearer ' + authStore.token,
        };
      }
    },
    onResponse: ({ response }) => {
      switch (response.status) {
        case 401:
        case 419:
        case 503:
          if (!isNitro()) {
            authStore.logout(true);
          }
          break;
      }
    },
  });
};

/**
 * Determine if the current method is called before Nuxt modules are
 * loaded. Vercel serverless functions can be called before modules
 * are loaded meaning the API proxy is not available.
 *
 * Subsequent calls to a Nuxt composable will also fail in this scenario.
 **/
export const isNitro = () => typeof process !== 'undefined';
