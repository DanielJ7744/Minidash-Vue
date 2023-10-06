<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <ServicesSettingsCustomEntityTemplate
      v-if="useAdvancedSelector || hasCustomEntities"
      :integration="integration"
      :destination-system="destinationSystem"
      :source-system="sourceSystem"
      :source-factory-systems="sourceFactorySystems"
      :destination-factory-systems="destinationFactorySystems"
      :show-back-button="useAdvancedSelector && !hasCustomEntities"
      @templateCreated="templateCreated"
      @pullFactorySystem="pullFactorySystem"
      @pushFactorySystem="pushFactorySystem"
      @toggleAdvancedSelector="toggleAdvancedSelector"
    />
    <UiTitledCard v-else title="Select entities">
      <div v-if="groupedFactorySystems.length">
        <FormElement
          title="service_template_id"
          label="Entity"
          :errors="errors"
          required
        >
          <ServicesSettingsGroupedFactorySystemSelector
            :disabled="makingRequest"
            :modelValue="selectedGroupFactorySystem"
            :grouped-factory-systems="groupedFactorySystems"
            @update:modelValue="makeServiceTemplate"
          />
        </FormElement>
      </div>
      <div v-else>
        No default combinations of entities could be found. Please try using the
        advanced selector.
      </div>
      <div>
        <button
          type="button"
          class="button button-secondary button-sm"
          @click="toggleAdvancedSelector"
        >
          Use advanced selector
        </button>
      </div>
    </UiTitledCard>
  </div>
</template>

<script>
import { findOrCreateServiceTemplate } from '@/lib/serviceTemplate';
import Systems from '@/enums/Systems';

export default {
  name: 'EntitySelector',
  props: {
    integration: {
      type: Object,
      required: true,
    },
    sourceSystem: {
      type: Object,
      required: true,
    },
    destinationSystem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      useAdvancedSelector: false,
      sourceFactorySystems: [],
      destinationFactorySystems: [],
      groupedFactorySystems: [],
      selectedGroupFactorySystem: null,
      makingRequest: false,
      errors: {},
    };
  },
  async fetch() {
    this.sourceFactorySystems = await fetchAllPaginatedResults(
      this.$axios,
      'api/api/v2/factory-systems',
      {
        'filter[system_id]': this.sourceSystem.id,
        'filter[direction]': 'pull',
        include: [
          'factorySystemServiceOptions.serviceOption',
          'entity',
          'integration',
          'serviceFactory',
        ].join(','),
      }
    );
    this.destinationFactorySystems = await fetchAllPaginatedResults(
      this.$axios,
      'api/api/v2/factory-systems',
      {
        'filter[system_id]': this.destinationSystem.id,
        'filter[direction]': 'push',
        include: [
          'factorySystemServiceOptions.serviceOption',
          'entity',
          'integration',
          'serviceFactory',
        ].join(','),
      }
    );
    this.groupFactorySystems();
  },
  computed: {
    hasCustomEntities() {
      return this.hasSourceCustomEntities || this.hasDestinationCustomEntities;
    },
    hasSourceCustomEntities() {
      return [Systems.S3, Systems.SFTP, Systems.INBOUND_API].includes(
        this.sourceSystem?.name
      );
    },
    hasDestinationCustomEntities() {
      return [Systems.BI, Systems.S3].includes(this.destinationSystem?.name);
    },
  },
  methods: {
    templateCreated(serviceTemplate) {
      this.$emit('templateCreated', serviceTemplate);
    },
    pullFactorySystem(factorySystem) {
      this.$emit('pullFactorySystem', factorySystem);
    },
    pushFactorySystem(factorySystem) {
      this.$emit('pushFactorySystem', factorySystem);
    },
    toggleAdvancedSelector() {
      this.useAdvancedSelector = !this.useAdvancedSelector;
    },
    groupFactorySystems() {
      this.sourceFactorySystems.forEach((source) => {
        const matchingDestinations = this.destinationFactorySystems.filter(
          (destination) => destination.entity.id === source.entity.id
        );
        if (!matchingDestinations.length) {
          return;
        }
        matchingDestinations.forEach((matchingDestination) => {
          this.groupedFactorySystems.push({
            id: parseInt(
              source.id.toString() + matchingDestination.id.toString()
            ),
            source,
            destination: matchingDestination,
          });
        });
      });
    },
    async makeServiceTemplate(selected) {
      this.selectedGroupFactorySystem = selected.id;
      this.makingRequest = true;
      try {
        const matchingGroup = this.groupedFactorySystems.find(
          (groupedFactorySystem) => groupedFactorySystem.id === selected.id
        );
        this.pullFactorySystem(matchingGroup.source);
        this.pushFactorySystem(matchingGroup.destination);
        const serviceTemplate = await findOrCreateServiceTemplate(
          this.$axios,
          matchingGroup.source,
          matchingGroup.destination,
          this.integration
        );
        if (!serviceTemplate.data.enabled) {
          this.$notify(
            {
              group: 'notifications',
              type: 'error',
              text: 'You are not able to use this entity at this moment.',
            },
            4000
          );
          this.errors.service_template_id = [
            'You are not able to use this entity at this moment. Please try the advanced selector.',
          ];
          this.makingRequest = false;
          return;
        }
        this.$emit('pullFactorySystem', selected.source);
        this.$emit('pushFactorySystem', selected.destination);
        this.$emit('templateCreated', serviceTemplate.data);
        this.makingRequest = false;
      } catch (error) {
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
