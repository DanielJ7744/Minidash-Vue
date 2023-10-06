<template>
  <UiTitledCard title="Service settings">
    <FormElement v-if="form.id" title="id" label="ID">
      <input :value="form.id" type="text" disabled />
    </FormElement>
    <FormElement
      v-model="form.type"
      title="type"
      label="Type"
      :errors="errors"
      required
      v-slot="{ inputProps, inputEvents }"
    >
      <select
        :disabled="isWebhookService"
        v-bind="inputProps"
        v-on="inputEvents"
      >
        <option v-for="type in availableTypes" :key="type">
          {{ type }}
        </option>
      </select>
    </FormElement>
    <FormElement
      v-model="form.description"
      title="description"
      label="Name"
      :errors="errors"
      required
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        maxlength="255"
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>
    <FormElement
      v-model="form.callsPerSecond"
      title="from_options.calls_per_second"
      label="Calls per second"
      :errors="errors"
      hidden
      v-slot="{ inputProps, inputEvents }"
    >
      <select
        id="service_calls_per_second"
        v-bind="inputProps"
        name="calls_per_second"
        class="w-full bg-white"
        v-on="inputEvents"
      >
        <option v-for="i in 5" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
    </FormElement>
  </UiTitledCard>
</template>

<script>
export default {
  name: 'ServiceSettings',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    selectedServiceTemplate: {
      type: Object,
      required: false,
      default: null,
    },
    sourceSystem: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  computed: {
    form: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    webhookFactoryName() {
      return this?.sourceSystem?.webhook_factory?.name;
    },
    isWebhookService() {
      return (
        this?.selectedServiceTemplate?.source_factory_system?.service_factory
          ?.name === this.webhookFactoryName &&
        this.webhookFactoryName !== undefined
      );
    },
    isLegacyWebhookService() {
      return !this.isWebhookService && this.form.type.toLowerCase() === 'event';
    },
    availableTypes() {
      // Handle new webhook service format
      if (this.isWebhookService) {
        return ['Event'];
      }
      // Handle legacy webhook services
      if (this.isLegacyWebhookService) {
        return ['Event', 'Standard', 'Sweeper'];
      }
      // Handle standard services
      return ['Standard', 'Sweeper'];
    },
  },
};
</script>
