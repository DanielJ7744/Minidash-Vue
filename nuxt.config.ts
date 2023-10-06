// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['@/assets/css/styles.scss'],

  build: {
    transpile: ['primevue', 'notiwind'],
  },

  // typescript: {
  //   typeCheck: true,
  //   // strict: true,
  // },

  modules: [
    'nuxt-icon', // https://icones.js.org/collection/la
    'nuxt-gtag',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt-alt/proxy',
    'nuxt-typed-router',
    'nuxt-monaco-editor',
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/html-validator',
  ],

  gtag: {
    id: process.env.GA4_TAG,
  },

  imports: {
    dirs: ['stores'],
  },

  app: {
    head: {
      title: 'Dashboard | Patchworks',
      meta: [
        {
          name: 'description',
          content:
            'Automate and manage the flow of data across your entire business',
        },
      ],
    },
  },

  runtimeConfig: {
    // Private keys are only available on the server
    secureSecret: '123',
    // Public keys that are exposed to the client
    public: {
      fabricUrl: process.env.FABRIC_URL || 'http://localhost:6121',
      inboundUrl:
        process.env.INBOUND_URL || 'https://inbound.wearepatchworks.com',
      webhookHandlerUrl:
        process.env.WEBHOOK_HANDLER_URL || 'https://webhook-handler.pwks.co',
      intercomAppId: process.env.INTERCOM_APP_ID || undefined,
    },
  },

  nuxtTypedRouter: {
    plugin: true,
    strict: true,
  },

  proxy: {
    enableProxy: true,
    proxies: {
      '/fabric': {
        target: process.env.FABRIC_URL || 'http://localhost:6121',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fabric/, ''),
      },
      '/core-main': {
        target: process.env.CORE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/core-main/, ''),
      },
      '/core-secrets': {
        target: process.env.SECRETS_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/core-secrets/, ''),
      },
      '/core-initialise': {
        target: process.env.INITIALISE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/core-initialise/, ''),
      },
    },
    fetch: true,
  },
});
