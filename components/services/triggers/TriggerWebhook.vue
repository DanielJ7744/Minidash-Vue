<template>
  <div>
    <UiTitledCard title="Webhooks">
      <template #content>
        <DataTable :value="webhooks">
          <Column
            v-for="col of columns"
            :field="col.field"
            :header="col.label"
          ></Column>
          <Column>
            <template #body="prop">
              <div class="space-x-1 text-right text-gray-500">
                <UiDropdownMenu
                  :links="[
                    {
                      title: `${webhookStatus(prop.data)} Webhook`,
                      action: () => updateWebhookStatus(prop.data),
                      if: $can('update webhooks'),
                    },
                    {
                      title: 'Delete Webhook',
                      action: () => deleteWebhook(prop.data),
                      if: $can('delete webhooks'),
                    },
                  ]"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <div class="flex flex-1 justify-end space-x-2 py-5">
          <button
            v-if="hasAvailableEventTypes"
            class="button button-primary"
            @click="openModal('createWebhook')"
          >
            Create
          </button>
          <div v-else class="message message--fail message--flex content--ml-5">
            <span class="icon icon--warning" />
            No available event types for the target entity.
          </div>
        </div>
      </template>
    </UiTitledCard>

    <Modal
      id="createWebhook"
      title="Add a New Webhook"
      classes="modal--medium-tall"
    >
      <ServicesTriggersWebhookCreationModal
        :service="service"
        :fields="webhookFields"
        :event-types="eventTypes"
        @webhookCreated="emitWebhookCreated"
        @closeModal="closeModal()"
      />
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'TriggerWebhook',
  props: {
    service: {
      type: Object,
      required: true,
    },
    webhooks: {
      type: Array,
      required: true,
    },
    eventTypes: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      isValid: null,
      alertStatusChanged: 'webhookTable' + Date.now(),
    };
  },
  computed: {
    hasAvailableEventTypes() {
      return this.eventTypes.length > 0;
    },
    columns() {
      return [
        {
          label: 'Status',
          field: 'status',
        },
        {
          label: `${this.service.source_system.name} Ref`,
          field: 'remote_reference',
        },
        {
          label: 'Event Type',
          field: 'event_type.name',
        },
      ];
    },
    webhookFields() {
      return {
        service_id: {
          type: 'hidden',
          label: null,
          show: false,
        },
        event_type_id: {
          type: 'select',
          label: 'Event Type',
          options: this.eventTypes,
        },
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    webhookStatus(webhook) {
      return webhook.active ? 'Disable' : 'Enable';
    },
    emitWebhookCreated(webhook) {
      this.$emit('webhookCreated', webhook);
    },
    emitWebhookUpdated(webhook) {
      this.$emit('webhookUpdated', webhook);
    },
    emitWebhookDeleted(webhook) {
      this.$emit('webhookDeleted', webhook);
    },
    refreshWebhookTable() {
      this.alertStatusChanged = 'webhookTable' + Date.now();
    },
    async updateWebhookStatus(webhook) {
      try {
        const response = await this.$axios
          .$patch(`/api/api/v2/webhooks/${webhook.id}`, {
            active: !webhook.active,
          })
          .then((r) => r.data);
        this.emitWebhookUpdated(response);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Webhook status updated',
          },
          5000
        );
        this.refreshWebhookTable();
      } catch (e) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Failed to update webhook status',
          },
          5000
        );
      }
    },
    async deleteWebhook(webhook) {
      const confirmed = confirm(
        'Are you sure you want to delete this webhook?'
      );
      if (confirmed) {
        try {
          await this.$axios.$delete(`/api/api/v2/webhooks/${webhook.id}`);
          this.emitWebhookDeleted(webhook.id);
          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Webhook successfully deleted',
            },
            5000
          );
          this.refreshWebhookTable();
        } catch (e) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'Failed to delete webhook',
            },
            5000
          );
        }
      }
    },
  },
};
</script>
