<template>
  <div>
    <Modal id="deleteIntegrationModal" classes="modal--small">
      <LegacyIntegrationsDeleteIntegrationModal @delete="deleteIntegration()" />
    </Modal>
    <Breadcrumb
      current-page="Manage Integration"
      :crumbs="{ 'All Integrations': '/admin/manage-integrations' }"
    />
    <PageHeader>
      <template #title>Manage Integration</template>
    </PageHeader>
    <UiLoading v-if="$fetchState.pending" />
    <form v-else @submit.prevent="saveIntegration()">
      <UiTitledCard title="General">
        <div class="mb-2">
          <label> Name </label>
          <input
            v-model="integration.name"
            type="text"
            class="w-full"
            placeholder="Please enter a name"
            pattern="[a-zA-Z0-9 \-&]+"
            title="Name value must only contain alphanumeric, ampersand, dash and space characters."
            required
            :disabled="submitting"
          />
        </div>
        <div class="mb-2">
          <label> Username </label>
          <input
            v-model="integration.username"
            type="text"
            class="w-full"
            placeholder="Please enter a username"
            pattern="[a-zA-Z0-9 \-&[\]\+_]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            required
            :disabled="submitting"
          />
        </div>
        <div class="mb-2">
          <label> Server </label>
          <input
            v-model="integration.server"
            type="text"
            class="w-full"
            placeholder="Please enter a server"
            pattern="[a-zA-Z0-9 \-&[\]\+_]+"
            title="Name must contain alphanumeric, ampersand, dash and space characters only."
            required
            :disabled="submitting"
          />
        </div>
      </UiTitledCard>
      <hr />
      <div
        class="flex justify-between flex-col-reverse md:flex-row gap-2"
      >
        <div class="text-right">
          <button
            type="button"
            class="button button-danger"
            :disabled="submitting"
            @click="openModal('deleteIntegrationModal')"
          >
            Delete Integration
          </button>
        </div>
        <div class="flex justify-between gap-2">
          <button
            type="button"
            class="w-full button button-secondary"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full button button-primary"
            :disabled="submitting"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

import { mapActions } from 'pinia';

export default {
  name: 'Index',
  beforeRouteEnter(to, from, next) {
    if (from.name !== 'admin-manage-integrations') {
      next('/settings');
    } else {
      next();
    }
  },
  async fetch() {
    this.integration = await this.$axios
      .$get(`/api/api/v2/admin/integrations/${this.integrationId}`)
      .then((r) => r.data);
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      integration: null,
      submitting: false,
    };
  },
  computed: {
    integrationId() {
      return this.route.params.integrationId;
    },
    payload() {
      return {
        name: this.integration?.name,
        username: this.integration?.username,
        server: this.integration?.server,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    async saveIntegration() {
      this.submitting = true;
      try {
        await this.$axios.$patch(
          `/api/api/v2/admin/integrations/${this.integrationId}`,
          this.payload
        );
        this.showSubmitSuccess(false);
      } catch (error) {
        this.showSubmitFail(error);
      }
    },
    async deleteIntegration() {
      this.submitting = true;
      try {
        await this.$axios.$delete(
          `/api/api/v2/admin/integrations/${this.integrationId}`
        );
        this.showSubmitSuccess(true);
      } catch (error) {
        this.showSubmitFail(error, true);
      }
    },
    showSubmitSuccess(isDelete = false) {
      this.submitting = false;
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: isDelete
            ? 'Delete integration successfully'
            : 'Successfully saved integration',
        },
        4000
      );
      navigateTo({ name: 'admin-manage-integrations' });
    },
    showSubmitFail(error, isDelete = false) {
      this.submitting = false;
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: isDelete
            ? `Failed to delete integration: ${error}`
            : `Failed saving integration: ${error}`,
        },
        4000
      );
    },
  },
};
</script>
