<template>
  <UiSlideOver
    class="w-96"
    from-right
    wide
    :mobile-only="false"
    :open="open"
    @close="$emit('close')"
  >
    <div class="flex flex-col py-6 h-full divide-y">
      <div class="flex-1 divide-y overflow-y-auto">
        <div class="pb-4 px-4">
          <h4 class="h5">Filters</h4>
        </div>
        <!-- Status -->
        <div class="px-4 py-4">
          <div role="group">
            <div>
              <h6 class="h6 text-sm">Status</h6>
              <div class="mt-4 space-y-4 px-4">
                <div
                  v-for="value in ['all', true, false]"
                  :key="value"
                  class="flex items-center"
                >
                  <input
                    :id="`status--${value.toString()}`"
                    v-model="filters.status"
                    :value="value"
                    name="status"
                    type="radio"
                  />
                  <label :for="`status--${value.toString()}`" class="ml-3">
                    {{
                      value === 'all' ? 'All' : value ? 'Active' : 'Inactive'
                    }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Source Systems -->
        <div class="px-4 py-4">
          <div role="group">
            <div>
              <h6 class="h6 text-sm">Source System</h6>
              <div class="mt-4 space-y-4 px-4">
                <div
                  v-for="sourceSystem in [
                    { id: 'all', name: 'All' },
                    ...sourceSystems,
                  ]"
                  :key="sourceSystem.id"
                  class="flex items-center"
                >
                  <input
                    :id="`source-systems--${sourceSystem.id}`"
                    v-model="filters.sourceSystemId"
                    name="destination-integration"
                    :value="sourceSystem.id"
                    type="radio"
                  />
                  <label
                    :for="`source-systems--${sourceSystem.id}`"
                    class="ml-3"
                  >
                    {{ sourceSystem.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Source Entity -->
        <div class="px-4 py-4">
          <div role="group">
            <div>
              <h6 class="h6 text-sm">Source Entity</h6>
              <div class="mt-4 space-y-4 px-4">
                <div
                  v-for="sourceEntity in [
                    { id: 'all', name: 'All' },
                    ...sourceEntities,
                  ]"
                  :key="sourceEntity.id"
                  class="flex items-center"
                >
                  <input
                    :id="`source-entity--${sourceEntity.id}`"
                    v-model="filters.sourceEntityId"
                    name="source-entity"
                    :value="sourceEntity.id"
                    type="radio"
                  />
                  <label
                    :for="`source-entity--${sourceEntity.id}`"
                    class="ml-3"
                  >
                    {{ sourceEntity.name }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-between px-4 pt-4">
        <button
          type="button"
          class="button button-secondary"
          @click="clearFilters()"
        >
          Reset
        </button>
        <button
          type="button"
          class="button button-primary"
          @click="applyFilters()"
        >
          Apply
        </button>
      </div>
    </div>
  </UiSlideOver>
</template>

<script>
import collect from 'collect.js';

const initialFilters = {
  status: 'all',
  sourceSystemId: 'all',
  sourceEntityId: 'all',
};

export default {
  name: 'ServiceFilterSlideOver',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    services: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      filters: { ...initialFilters },
    };
  },
  computed: {
    sourceSystems() {
      return collect(this.services)
        .map(service => service.source_system)
        .filter(system => !!system)
        .unique('id')
        .all();
    },
    sourceEntities() {
      return collect(this.services)
        .map(service => service.source_entity)
        .filter(entity => !!entity)
        .unique('id')
        .all();
    },
  },
  methods: {
    clearFilters() {
      this.filters = { ...initialFilters };
      this.$emit('filtered', { ...this.filters });
    },
    applyFilters() {
      this.$emit('filtered', { ...this.filters });
      this.$emit('close');
    },
  },
};
</script>
