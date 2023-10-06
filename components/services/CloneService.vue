<template>
  <UiLoading v-if="makingRequest" class="relative h-36" />
  <div v-else-if="hasError">
    <UiError class="relative h-36" :message="errorMessage" />
    <div class="flex justify-center">
      <button
        type="button"
        class="button button-primary"
        @click="closeModal"
      >
        Close
      </button>
    </div>
  </div>
  <div v-else>
    <div
      v-if="serviceToClone.source && serviceToClone.destination"
      class="flex justify-around font-medium"
    >
      <div>
        {{ serviceToClone.source }}
      </div>
      <div class="icon icon--arrow-right" />
      <div>
        {{ serviceToClone.destination }}
      </div>
    </div>
    <div class="flex items-center justify-center mt-2">
      <div>Are you sure you want to clone this service?</div>
    </div>
    <div class="flex items-center justify-around mt-2">
      <button
        type="button"
        class="button button-secondary"
        @click="closeModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-primary"
        @click="cloneService"
      >
        Yes
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'CloneService',
  props: {
    serviceToClone: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      makingRequest: false,
      hasError: false,
      errorMessage: null,
    };
  },
  computed: {
    sourceFactorySystemId() {
      return this.serviceToClone.source_factory_system.id;
    },
    destinationFactorySystemId() {
      return this.serviceToClone.destination_factory_system.id;
    },
    servicePayload() {
      const payload = {
        description: 'Copy of ' + this.serviceToClone.description,
        type: this.serviceToClone.type || 'Standard',
        schedule: this.serviceToClone.schedule,
        from_environment: this.serviceToClone.from_environment,
        to_environment: this.serviceToClone.to_environment,
        from_mapping_name: this.serviceToClone.from_mapping,
        to_mapping_name: this.serviceToClone.to_mapping,
      };

      const currentFromOptions = this.serviceToClone.from_options;
      if (!('max_attempts' in currentFromOptions)) {
        currentFromOptions.max_attempts = 4;
      }

      if (!('page_size' in currentFromOptions)) {
        currentFromOptions.page_size = 50;
      }

      payload.from_options = currentFromOptions;

      if (this.serviceToClone.to_options) {
        payload.to_options = this.serviceToClone.to_options;
      }

      return payload;
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    async cloneService() {
      try {
        this.makingRequest = true;
        const serviceTemplates = await this.findServiceTemplates();
        let matchingTemplate = serviceTemplates.find(
          serviceTemplate =>
            serviceTemplate.integration_id ===
            this.serviceToClone.integration_id
        );
        if (!matchingTemplate) {
          matchingTemplate = serviceTemplates.find(
            serviceTemplate => serviceTemplate.integration_id === null
          );
        }
        const payload = {
          service_template_id: matchingTemplate.id,
          ...this.servicePayload,
        };
        await this.$axios.$post(
          `/api/api/v2/integrations/${this.serviceToClone.integration_id}/services`,
          payload
        );
        this.makingRequest = false;
        this.$emit('serviceCloned');
        this.closeModal();
      } catch (error) {
        this.hasError = true;
        this.errorMessage = error;
        this.makingRequest = false;
      }
    },
    findServiceTemplates() {
      const filterString = `filter[source_factory_system_id]=${this.sourceFactorySystemId}&filter[destination_factory_system_id]=${this.destinationFactorySystemId}`;

      return this.$axios
        .$get(`/api/api/v2/service-templates?${filterString}`)
        .then(r => r.data);
    },
  },
};
</script>
