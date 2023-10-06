<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <form v-else @submit.prevent="saveSystemAuthorisationType">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this authorisation type."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteSystemAuthorisationType"
      />
    </Modal>
    <SystemSystemAuthorisationFields
      :initial-data="payload"
      :making-request="makingRequest"
      @detailsUpdated="formUpdated"
    />
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="systemAuthorisationTypeId"
          type="button"
          class="button button-danger"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete System Authorisation Type
        </button>
      </div>
      <div v-if="makingRequest">
        <UiLoading label="Saving system..." />
      </div>
      <div>
        <button
          type="button"
          class="button button-secondary"
          :disabled="makingRequest"
          @click="navigateToSystem"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="button button-primary"
          :disabled="makingRequest"
        >
          Save
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'Form',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    systemAuthorisationTypeId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      systemAuthorisationType: null,
      makingRequest: false,
      deleteConfirm: null,
      payload: {
        system_id: this.systemId,
        authorisation_type_id: null,
        credentials_schema: {},
      },
    };
  },
  async fetch() {
    if (this.systemAuthorisationTypeId) {
      this.systemAuthorisationType = await this.$axios
        .$get(
          `/api/api/v2/system-authorisation-types/${this.systemAuthorisationTypeId}?include=authorisationType`
        )
        .then((r) => r.data);
      this.payload.authorisation_type_id = this.systemAuthorisationType.authorisation_type.id;
      if (this.systemAuthorisationType.credentials_schema) {
        this.payload.credentials_schema = this.systemAuthorisationType.credentials_schema
      }
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    formUpdated(updatedData) {
      this.payload = updatedData;
    },
    async saveSystemAuthorisationType() {
      if (this.systemAuthorisationTypeId) {
        await this.updateSystemAuthorisationType();
      } else {
        await this.createSystemAuthorisationType();
      }
    },
    async deleteSystemAuthorisationType() {
      try {
        this.closeModal();
        this.makingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/system-authorisation-types/${this.systemAuthorisationTypeId}`
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted the authorisation type.',
          },
          4000
        );
        this.navigateToSystem();
        this.makingRequest = false;
        this.closeModal();
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete authorisation type: ${error}`,
          },
          4000
        );
      }
    },
    async updateSystemAuthorisationType() {
      try {
        this.makingRequest = true;
        await this.$axios.$patch(
          `/api/api/v2/admin/system-authorisation-types/${this.systemAuthorisationTypeId}`,
          this.payload
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved the authorisation type.',
          },
          4000
        );
        this.navigateToSystem();
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save authorisation type: ${error}`,
          },
          4000
        );
      }
    },
    async createSystemAuthorisationType() {
      try {
        this.makingRequest = true;
        await this.$axios.$post(
          '/api/api/v2/admin/system-authorisation-types',
          this.payload
        );
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved the authorisation type.',
          },
          4000
        );
        this.navigateToSystem();
        this.makingRequest = false;
      } catch (error) {
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to save authorisation type: ${error}`,
          },
          4000
        );
      }
    },
    navigateToSystem() {
      navigateTo({
        name: 'admin-manage-systems-systemId',
        params: {
          systemId: this.systemId,
        },
      });
    },
  },
};
</script>
