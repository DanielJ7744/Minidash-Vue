<template>
  <div>
    <div class="items-center py-4 space-y-3 sm:space-y-0 sm:flex">
      <div class="flex-1">
        <label class="mb-1">Event Type</label>
        <select v-model="selectedEventType" class="content--full-width w-full">
          <option v-for="eventType in eventTypes" :key="eventType.key" :value="eventType">
            {{ eventType.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-for="field in webhookSchemaFields" :key="field.key" class="items-center py-4 space-y-3 sm:space-y-0 sm:flex">
      <div class="flex-1">
        <label class="mb-1">{{ field.label }}</label>
        <input
          v-if="field.type === 'input'"
          v-model="formData[field.key]"
          :value="getValue(field.key)"
          :type="field.type"
          :required="field.required"
          :class="{'form-item__failed': formHasErrors && getValue(field.key) === null}"
          class="content--full-width w-full mb-3"
        >
        <TreeSelect
          v-if="field.type === 'tree-select' && selectedEventType.schema_values[field.key] !== null"
          v-model="formData[field.key]"
          :options="selectedEventType.schema_values[field.key]"
          :placeholder="field.placeholder"
        />
      </div>
    </div>

    <div class="items-center py-4 space-y-3 sm:space-y-0 sm:flex">
      <div class="flex-1">
        <label class="mb-1">URL</label>
        <input id="url" type="text" :value="url" disabled class="content--full-width w-full bg-white mb-3">
      </div>
    </div>
    <div class="flex justify-end flex-1 py-5 space-x-2">
      <button class="button button-primary" :disabled="submitting" @click="handleSubmit()">
        Save
      </button>
    </div>
  </div>
</template>

<script>
import TreeSelect from 'primevue/treeselect';

export default {
  name: 'WebhookCreationModal',
  props: {
    service: {
      type: Object,
      required: true
    },
    fields: {
      type: Object,
      required: true
    },
    eventTypes: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      formData: {},
      submitting: false,
      formHasErrors: false,
      selectedEventType: this.eventTypes[0] ?? '',
      webhookURL: useRuntimeConfig().public.webhookHandlerUrl
    }
  },
  computed: {
    url () {
      const formattedEventType = this.selectedEventType.key.replace('/', '_')
      const method = this.service.source_system.webhook_method.toLowerCase()

      return `${this.webhookURL}/${this.service.source_system.factory_name.toLowerCase()}/${method}/webhook/${this.service.username}/${formattedEventType}/${this.service.destination_system.factory_name.toLowerCase()}/${this.service.id}`
    },
    webhookSchemaFields () {
      return this.service.source_system.webhook_schema ?? []
    }
  },
  methods: {
    async handleSubmit () {
      this.submitting = true
      if (!this.isValidForm()) {
        this.formHasErrors = true
        this.submitting = false

        return
      }
      try {
        const webhookResponse = await this.$axios.$post('api/api/v2/webhooks', {
          service_id: this.service.id,
          event_type_id: this.selectedEventType.id,
          payload: this.formData
        }).then(r => r.data)

        if (webhookResponse.service.id === this.service.id) {
          this.$emit('closeModal')
          this.$emit('webhookCreated', webhookResponse)
          this.$notify({ group: 'notifications', type: 'success', text: 'Webhook successfully created' }, 5000)
        }
      } catch (e) {
        this.$notify({ group: 'notifications', type: 'error', text: 'Failed to create webhook' }, 5000)
      }

      this.submitting = false
    },
    getValue (key) {
      return this.formData[key] ?? null
    },
    isValidForm () {
      for (const field of this.webhookSchemaFields) {
        if (!(field.key in this.formData) && field?.required === true) {
          return false
        }
      }

      return true
    }
  },
};
</script>
