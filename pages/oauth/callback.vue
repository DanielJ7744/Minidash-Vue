<template>
  <div>
    <UiLoading
      v-if="system === null"
      class="flex items-center justify-center"
    />
    <Modal
      v-if="system !== null"
      id="getSystemCredentials"
      :close-on-backdrop-click="false"
      classes="modal--medium-tall"
    >
      <IntegrationsCredentialsModal
        :system="system"
        :fields="getCredentialFields(system)"
        :extra-form-data="extraFormData"
        :auth-type="'oauth2'"
      />
    </Modal>
  </div>
</template>
<script>
import { mapActions } from 'pinia';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

export default {
  name: 'OAuthCallback',
  mixins: [systemsHelperMixin],
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      system: null,
      extraFormData: {},
    };
  },
  async created() {
    this.extraFormData = this.route.query;
    // await this.$router.replace({ name: 'oauth-callback' });

    if ('system' in this.extraFormData) {
      this.system = await this.$axios
        .get(
          `/api/api/v2/systems?filter[name]=${this.extraFormData.system}&include=systemAuthorisationTypes.authorisationType`
        )
        .then((r) => r.data.data[0]);
      this.openModal('getSystemCredentials');
    }

    if (this.system === null) {
      const response = await this.$axios.post(
        '/api/api/v2/oauth-2/callback',
        this.extraFormData
      );

      this.$notify(
        {
          group: 'notifications',
          type: response?.status === 200 ? 'success' : 'error',
          text:
            response?.status === 200
              ? 'Successfully created connector'
              : 'Failed to create connector',
        },
        4000
      );

      navigateTo({ name: 'connections' });
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    getCredentialFields(system) {
      return systemsHelperMixin.methods.getCredentialFields(system);
    },
  },
};
</script>
