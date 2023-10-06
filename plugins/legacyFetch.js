export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.mixin({
    data() {
      if (!usesFetch(this)) {
        return {};
      }

      return {
        fetchState: {
          pending: true,
          error: null,
        },
      };
    },
    async created() {
      this.$fetch();
    },

    computed: {
      $fetchState() {
        return this.fetchState;
      },
    },

    methods: {
      async $fetch() {
        if (process.server || !usesFetch(this)) {
          return;
        }

        try {
          this.fetchState.pending = true;

          await this.$options.fetch.bind(this)();
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[fetch]', error);
          }
          this.fetchState.error = error?.message || 'An error occurred.';
        } finally {
          this.fetchState.pending = false;
        }
      },
    },
  });
});

const usesFetch = component => !!component.$options?.fetch;
