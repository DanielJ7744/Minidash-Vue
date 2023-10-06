<template>
  <div>
    <UiLoading class="flex items-center justify-center" />
  </div>
</template>
<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

export default {
  name: 'OAuth1Callback',
  mixins: [systemsHelperMixin],
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      extraFormData: {},
    };
  },
  async created() {
    this.extraFormData = this.route.query;
    // await this.$router.replace({ name: 'oauth-1-callback' });
    const response = await this.$axios.post(
      '/api/api/v2/oauth-1/callback',
      this.extraFormData
    );
    this.$notify(
      {
        group: 'notifications',
        type: response.status === 200 ? 'success' : 'error',
        text:
          response.status === 200
            ? 'Successfully created connector'
            : 'Failed to create connector',
      },
      4000
    );

    navigateTo({ name: 'connections' });
  },
};
</script>
