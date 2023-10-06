<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <div v-if="!$fetchState.pending">
      <PageHeader>
        <template #title>Service Trigger</template>
      </PageHeader>

      <ServicesTriggersTriggerSelect
        v-model="serviceType"
        :service="service"
        :webhooks="webhooks"
        @deleteWebhooks="deleteWebhooks"
      />
      <ServicesTriggersTriggerSchedule
        v-if="serviceType === 'Schedule'"
        :service="service"
      />
      <ServicesTriggersTriggerWebhook
        v-if="serviceType === 'Webhook'"
        :service="service"
        :webhooks="webhooks"
        :event-types="filteredEventTypes"
        @webhookCreated="webhookCreated"
        @webhookUpdated="webhookUpdated"
        @webhookDeleted="webhookDeleted"
      />
    </div>
    <UiLoading v-else />
  </div>
</template>

<script>
export default {
  name: 'Trigger',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      webhooks: [],
      eventTypes: [],
    };
  },
  async fetch() {
    [this.webhooks, this.eventTypes] = await Promise.all([
      this.$axios
        .$get(
          `/api/api/v2/webhooks/?filter[service_id]=${this.service.id}&include=integration,eventType`
        )
        .then((r) => r.data),
      this.$axios
        .$get(
          `/api/api/v2/event-types/?filter[system_id]=${this.service.source_system_id}&include=entities`
        )
        .then((r) => r.data),
    ]);
  },
  computed: {
    filteredEventTypes() {
      return this.eventTypes.filter(
        (eventType) =>
          eventType.entities.filter(
            (entity) => this.service.destination_entity.id === entity.id
          ).length > 0
      );
    },
    serviceType() {
      if (this.service.type.toLowerCase() === 'event') {
        return 'Webhook';
      }

      return this.service.schedule === 'off' ? 'Off' : 'Schedule';
    },
  },
  methods: {
    webhookCreated(webhook) {
      this.webhooks.push(webhook);
    },
    webhookUpdated(updatedWebhook) {
      this.webhooks[
        this.webhooks.findIndex((webhook) => webhook.id === updatedWebhook.id)
      ] = updatedWebhook;
    },
    webhookDeleted(webhookId) {
      this.webhooks = this.webhooks.filter(
        (webhook) => webhook.id !== webhookId
      );
    },
    async deleteWebhooks() {
      for await (const webhook of this.webhooks) {
        try {
          await this.$axios.$delete(`/api/api/v2/webhooks/${webhook.id}`);

          this.webhookDeleted(webhook.id);
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
