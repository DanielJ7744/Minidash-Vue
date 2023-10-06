<template>
  <UiTitledCard title="Trigger">
    <div>
      <label class="mb-1">Type</label>
      <select
        v-model="selectedType"
        :disabled="isWebhookService"
        class="w-full bg-white"
        @change="change"
      >
        <option v-for="type in triggerTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
    </div>
  </UiTitledCard>
</template>

<script>
const EventBus = useLegacyEventBus();

export default {
  name: 'TriggerSelect',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedType: this.modelValue,
      previousType: this.modelValue,
    };
  },
  computed: {
    triggerTypes() {
      // Handle new webhook service format and legacy format
      if (this.isWebhookService || this.isLegacyWebhookService) {
        return ['Webhook', 'Off'];
      }

      // Handle standard services
      return ['Schedule', 'Off'];
    },
    isWebhookService() {
      if (
        !this.service?.service_template?.source_factory_system?.service_factory
          ?.name
      ) {
        return false;
      }

      return (
        this.service?.service_template?.source_factory_system?.service_factory
          ?.name ===
        this.service?.service_template?.source_factory_system?.system
          .webhook_factory?.name
      );
    },
    isLegacyWebhookService() {
      return (
        !this.isWebhookService && this.service.type.toLowerCase() === 'event'
      );
    },
  },
  watch: {
    selectedType(type) {
      this.previousType = type;
    },
  },
  methods: {
    change(event) {
      const newType = event.currentTarget.value;
      if (newType === 'Webhook' || this.previousType !== 'Webhook') {
        this.updateService(newType);
        this.selectedType = newType;

        return;
      }

      const confirmed = confirm(
        `Switching to ${newType} will delete all existing webhooks for this service.\n\nAre you sure you want to continue?`
      );
      if (confirmed) {
        this.emitDeleteWebhooks();
        this.updateService(newType);
        this.selectedType = newType;

        return;
      }

      this.selectedType = this.previousType;
    },
    async updateService(triggerType) {
      try {
        const schedule = this.getScheduleFromType(triggerType);
        const type = this.getServiceTypeFromTriggerType(triggerType);
        await this.$axios.$patch(`/api/api/v2/services/${this.service.id}`, {
          schedule,
          type,
        });

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Service trigger updated',
        });
        EventBus.emit('service:updated', this.service.id);
        this.$emit('update:modelValue', triggerType);
      } catch (error) {
        console.error(error);

        this.$notify({
          group: 'notifications',
          type: 'error',
          text: 'An error occurred',
        });
      }
    },
    getScheduleFromType(triggerType) {
      switch (triggerType) {
        case 'Off':
          return 'off';
        case 'Schedule':
          return '*/10 * * * *';
        case 'Webhook':
          return 'event';
      }
    },
    getServiceTypeFromTriggerType(triggerType) {
      if (triggerType === 'Webhook') {
        return 'Event';
      }

      return this.service.type;
    },
    emitDeleteWebhooks() {
      this.$emit('deleteWebhooks', true);
    },
  },
};
</script>
