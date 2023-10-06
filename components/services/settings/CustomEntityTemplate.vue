<template>
  <UiTitledCard title="Select entities">
    <UiLoading v-if="$fetchState.pending" class="relative h-36" />
    <UiError
      v-else-if="$fetchState.error"
      class="relative h-36"
      message="An error occurred."
    />
    <template v-else>
      <div>
        <FormElement
          title="source_factory_system"
          label="Source Entity"
          required
        >
          <EntitiesCustomEntitySelector
            :disabled="makingRequest"
            :modelValue="pullFactorySystem"
            :factory-systems="pullFactorySystems"
            @update:modelValue="factorySystemSelected($event, 'pull')"
          />
        </FormElement>
      </div>
      <div>
        <FormElement
          title="destination_factory_system"
          label="Destination Entity"
          required
        >
          <EntitiesCustomEntitySelector
            :disabled="makingRequest"
            :modelValue="pushFactorySystem"
            :factory-systems="pushFactorySystems"
            @update:modelValue="factorySystemSelected($event, 'push')"
          />
        </FormElement>
      </div>
      <div v-if="error">
        <p class="text-danger-600 text-xs">
          {{ error }}
        </p>
      </div>
      <div v-if="showBackButton">
        <button
          type="button"
          class="button button-secondary button-sm"
          @click="$emit('toggleAdvancedSelector')"
        >
          Go back
        </button>
      </div>
    </template>
  </UiTitledCard>
</template>

<script>
import { findOrCreateServiceTemplate } from '@/lib/serviceTemplate';

export default {
  name: 'CustomEntityTemplate',
  props: {
    sourceSystem: {
      type: Object,
      required: true,
    },
    destinationSystem: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
    sourceFactorySystems: {
      type: Array,
      required: false,
      default: null,
    },
    destinationFactorySystems: {
      type: Array,
      required: false,
      default: null,
    },
    showBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      pullFactorySystem: null,
      pushFactorySystem: null,
      pullFactorySystems: [],
      pushFactorySystems: [],
      makingRequest: false,
      error: null,
    };
  },
  async fetch() {
    this.pullFactorySystems =
      !this.sourceFactorySystems || !this.sourceFactorySystems.length
        ? await this.getAllFactorySystems(this.sourceSystem.id, 'pull')
        : this.sourceFactorySystems;
    this.pushFactorySystems =
      !this.destinationFactorySystems || !this.destinationFactorySystems.length
        ? await this.getAllFactorySystems(this.destinationSystem.id, 'push')
        : this.destinationFactorySystems;
  },
  watch: {
    pullFactorySystem() {
      this.makeServiceTemplate();
    },
    pushFactorySystem() {
      this.makeServiceTemplate();
    },
  },
  methods: {
    factorySystemSelected(value, direction) {
      const dataKey = `${direction}FactorySystem`;
      this[dataKey] = value.id;
      this.$emit(dataKey, value);
    },
    async getAllFactorySystems(systemId, direction) {
      try {
        const dataKey = direction + 'FactorySystems';
        this[dataKey] = await fetchAllPaginatedResults(
          this.$axios,
          '/api/api/v2/factory-systems',
          {
            'filter[system_id]': systemId,
            'filter[direction]': direction,
            include: [
              'factorySystemServiceOptions.serviceOption',
              'entity',
              'integration',
            ].join(','),
          }
        ).then((r) => r.data);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `An error occurred while getting factory systems. Error: ${error}`,
          },
          4000
        );
      }
    },
    async makeServiceTemplate() {
      if (this.pullFactorySystem === null || this.pushFactorySystem === null) {
        return;
      }
      this.makingRequest = true;
      try {
        const matchingSource = this.pullFactorySystems.find(
          (pullSystem) => pullSystem.id === this.pullFactorySystem
        );
        const matchingDestination = this.pushFactorySystems.find(
          (pushSystem) => pushSystem.id === this.pushFactorySystem
        );
        let serviceTemplate = await findOrCreateServiceTemplate(
          this.$axios,
          matchingSource,
          matchingDestination,
          this.integration
        );
        if ('data' in serviceTemplate) {
          serviceTemplate = serviceTemplate.data;
        }
        if (!serviceTemplate.enabled) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'You are not able to use this combination of entities at this moment.',
            },
            4000
          );
          this.error =
            'You are not able to use this combination of entities at this moment.';
          this.makingRequest = false;
          return;
        }
        this.$emit('templateCreated', serviceTemplate);
        this.makingRequest = false;
      } catch (error) {
        this.error = error;
        this.makingRequest = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `An error occurred while creating the service template. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
