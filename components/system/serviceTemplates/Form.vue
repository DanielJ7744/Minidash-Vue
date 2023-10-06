<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <form v-else @submit.prevent="saveServiceTemplate">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this service template."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteServiceTemplate"
      />
    </Modal>
    <UiTitledCard title="General">
      <SystemServiceTemplatesDetails
        v-model="payload"
        :making-request="makingRequest"
      />
    </UiTitledCard>
    <template v-if="serviceTemplateId">
      <hr />
      <UiTitledCard title="Options">
        <template #content>
          <TableServiceTemplateOptions
            :system-id="systemId"
            :service-template-id="serviceTemplateId"
          />
        </template>
      </UiTitledCard>
    </template>
    <hr />
    <div class="flex justify-between">
      <div>
        <button
          v-if="serviceTemplateId"
          type="button"
          class="button button-danger"
          :disabled="makingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Service Template
        </button>
      </div>
      <div v-if="makingRequest">
        <UiLoading label="Saving service template..." />
      </div>
      <div>
        <button
          type="button"
          class="button button-secondary"
          :disabled="makingRequest"
          @click="
            navigateTo({
              name: 'admin-manage-systems-systemId',
              params: { systemId },
            })
          "
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
    serviceTemplateId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      serviceTemplate: null,
      makingRequest: false,
      payload: {
        name: null,
        source_factory_system_id: null,
        destination_factory_system_id: null,
        source_system_id: null,
        destination_system_id: null,
        integration_id: null,
        enabled: false,
      },
    };
  },
  async fetch() {
    if (this.serviceTemplateId) {
      this.serviceTemplate = await this.$axios
        .$get(
          `/api/api/v2/admin/service-templates/${this.serviceTemplateId}?include=source.system,destination.system`
        )
        .then((r) => r.data);
      this.payload.name = this.serviceTemplate.name;
      this.payload.source_system_id =
        this.serviceTemplate.source_factory_system.system.id;
      this.payload.destination_system_id =
        this.serviceTemplate.destination_factory_system.system.id;
      this.payload.source_factory_system_id =
        this.serviceTemplate.source_factory_system.id;
      this.payload.destination_factory_system_id =
        this.serviceTemplate.destination_factory_system.id;
      this.payload.integration_id = this.serviceTemplate.integration_id;
      this.payload.enabled = this.serviceTemplate.enabled;
    }
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    updatePayload(updatedPayload) {
      this.payload = updatedPayload;
    },
    async saveServiceTemplate() {
      this.makingRequest = true;
      if (this.serviceTemplateId) {
        await this.updateServiceTemplate();
      } else {
        await this.createServiceTemplate();
      }
    },
    async createServiceTemplate() {
      if (this.checkForm(this.payload)) {
        this.makingRequest = false;
      } else {
        try {
          const serviceTemplate = await this.$axios
            .$post('/api/api/v2/admin/service-templates', this.payload)
            .then((r) => r.data);
          this.makingRequest = false;
          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Successfully saved service template',
            },
            4000
          );
          navigateTo({
            name: 'admin-manage-systems-systemId-manage-service-templates-serviceTemplateId',
            params: {
              systemId: this.systemId,
              serviceTemplateId: serviceTemplate.id,
            },
          });
        } catch (error) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: `Failed to save service template: ${error}`,
            },
            4000
          );
          this.makingRequest = false;
        }
      }
    },
    async updateServiceTemplate() {
      try {
        await this.$axios.$patch(
          `/api/api/v2/admin/service-templates/${this.serviceTemplateId}`,
          this.payload
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved service template',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to update service template: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async deleteServiceTemplate() {
      try {
        await this.$axios.$delete(
          `/api/api/v2/admin/service-templates/${this.serviceTemplateId}`
        );
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted service template',
          },
          4000
        );
        navigateTo({
          name: 'admin-manage-systems-systemId',
          params: {
            systemId: this.systemId,
          },
        });
        this.closeModal();
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to delete service template: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
        this.closeModal();
      }
    },
    checkForm(payload) {
      if (
        parseInt(payload.destination_system_id) !==
          parseInt(this.route.params.systemId) &&
        parseInt(payload.source_system_id) !==
          parseInt(this.route.params.systemId)
      ) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Source or Destination must be: ${this.route.params.systemName}`,
          },
          4000
        );
        return true;
      }
      return false;
    },
  },
};
</script>
