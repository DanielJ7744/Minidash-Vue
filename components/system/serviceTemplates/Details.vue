<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else class="space-y-2">
    <FormElement
      :modelValue="integrationToDisplay"
      title="integration"
      label="Integration"
      disabled
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        class="w-full"
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>
    <FormElement
      v-model="data.name"
      required
      :disabled="makingRequest"
      title="name"
      label="Name"
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        placeholder="Please enter a name."
        min="3"
        max="255"
        pattern="[a-zA-Z \-[\]!&0-9]+$"
        title="Name must contain alphanumeric, ampersand, dash and space characters only."
        class="w-full"
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>
    <div class="mb-2">
      <label class="mb-1 font-medium"> Enabled </label>
      <div class="flex items-center gap-x-5">
        <div class="flex items-center">
          <input
            v-model="data.enabled"
            type="radio"
            :value="true"
            name="serviceTemplateStatus"
          />
          <label>Yes</label>
        </div>
        <div class="flex items-center">
          <input
            v-model="data.enabled"
            type="radio"
            :value="false"
            name="serviceTemplateStatus"
          />
          <label>No</label>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-y-3">
      <div class="flex justify-between font-medium gap-x-2">
        <div>Source</div>
        <div>Destination</div>
      </div>
      <div class="flex items-center justify-between gap-x-2">
        <div class="grid w-full grid-cols-2">
          <div>
            <select
              v-model="data.source_system_id"
              class="w-full"
              required
              :disabled="makingRequest"
            >
              <option
                v-for="sourceSystem in systems"
                :key="sourceSystem.id + 'source'"
                :value="sourceSystem.id"
              >
                {{ sourceSystem.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end">
            <SystemIcon2
              v-if="data.source_system_id"
              :system="
                systems.find((system) => system.id === data.source_system_id)
              "
            />
          </div>
        </div>
        <div class="text-lg icon icon--arrow-right" />
        <div class="grid w-full grid-cols-2">
          <div class="flex justify-start">
            <SystemIcon2
              v-if="data.destination_system_id"
              :system="
                systems.find(
                  (system) => system.id === data.destination_system_id
                )
              "
            />
          </div>
          <div>
            <select
              v-model="data.destination_system_id"
              class="w-full"
              required
              :disabled="makingRequest"
            >
              <option
                v-for="destinationSystem in systems"
                :key="destinationSystem.id + 'destination'"
                :value="destinationSystem.id"
              >
                {{ destinationSystem.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between gap-x-2">
        <div class="w-full">
          <select
            v-model="data.source_factory_system_id"
            class="w-full"
            required
            :disabled="makingRequest || !data.source_system_id"
          >
            <option
              v-for="sourceFactorySystem in sourceFactorySystems"
              :key="sourceFactorySystem.id"
              :value="sourceFactorySystem.id"
            >
              {{ sourceFactorySystem.service_factory.name }} /
              {{ sourceFactorySystem.entity.name }}
            </option>
          </select>
        </div>
        <div class="text-lg icon icon--arrow-right" />
        <div class="w-full">
          <select
            v-model="data.destination_factory_system_id"
            class="w-full"
            required
            :disabled="makingRequest || !data.destination_system_id"
          >
            <option
              v-for="destinationFactorySystem in destinationFactorySystems"
              :key="destinationFactorySystem.id"
              :value="destinationFactorySystem.id"
            >
              {{ destinationFactorySystem.service_factory.name }} /
              {{ destinationFactorySystem.entity.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'ServiceTemplateDetails',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    makingRequest: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      allFactorySystems: [],
    };
  },
  async fetch() {
    this.allFactorySystems = await fetchAllPaginatedResults(
      this.$axios,
      '/api/api/v2/factory-systems?include=serviceFactory,entity,system',
      {
        include: ['serviceFactory', 'entity', 'system'].join(','),
      }
    );
    await this.loadSystems();
  },
  computed: {
    ...mapState(useSystemStore, {
      systems: 'systems',
    }),
    data: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    sourceFactorySystems() {
      const filteredFactorySystems = this.allFactorySystems.filter(
        (factorySystem) => factorySystem.direction.toLowerCase() === 'pull'
      );
      if (this.data.source_system_id) {
        return filteredFactorySystems.filter(
          (factorySystem) =>
            factorySystem.system.id === this.data.source_system_id
        );
      }
      return filteredFactorySystems;
    },
    destinationFactorySystems() {
      const filteredFactorySystems = this.allFactorySystems.filter(
        (factorySystem) => factorySystem.direction.toLowerCase() === 'push'
      );
      if (this.data.destination_system_id) {
        return filteredFactorySystems.filter(
          (factorySystem) =>
            factorySystem.system.id === this.data.destination_system_id
        );
      }
      return filteredFactorySystems;
    },
    integrationToDisplay() {
      return this.data.integration_id !== null
        ? this.data.integration_id
        : 'Global';
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    ...mapActions(useSystemStore, ['loadSystems']),
  },
};
</script>
