import axios from 'axios';

/**
 * This a polyfill for the deprecated $axios
 * Api calls should use the useFabric() composable instead
 * The axios dependency can be removed once all remaining calls are migrated
 */
export default defineNuxtPlugin((nuxtApp) => {
  const $axios = axios.create({
    baseURL: '/fabric',
    timeout: 60 * 1000,
  });

  for (const method of [
    'request',
    'delete',
    'get',
    'head',
    'options',
    'post',
    'put',
    'patch',
  ]) {
    $axios['$' + method] = function () {
      return this[method].apply(this, arguments).then((res) => res && res.data);
    };
  }

  $axios.interceptors.request.use(
    function (config) {
      const authStore = useAuthStore();

      config.url = config.url
        .replace('/api/api/', '/api/')
        .replace('api/api/', '/api/');
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authStore.token}`,
      };

      // if (import.meta.env.DEV) {
      //   console.warn('[$axios] $axios is deprecated, use useFabric() instead.');
      // }

      return config;
    },
    function (error) {
      if (import.meta.env.DEV) {
        console.error('[$axios]', error);
      }
      return Promise.reject(error);
    }
  );

  $axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      switch (error.response.status) {
        case 401:
        case 419:
        case 503:
          navigateTo({ name: 'logout' });
          break;
        default:
          return Promise.reject(error);
      }
    }
  );

  nuxtApp.vueApp.config.globalProperties.$axios = $axios;
});
