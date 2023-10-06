<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else class="space-y-2">
    <div class="grid gap-y-2">
      <div>
        <FormElement
          v-model="data.map_id"
          title="map_id"
          :label="allOptions.map_id.description"
          :required="allOptions.map_id.required"
          v-slot="{ inputProps, inputEvents }"
          :errors="errors"
        >
          <select v-bind="inputProps" v-on="inputEvents">
            <option v-for="map in mapsForSelect" :key="map.id" :value="map.id">
              {{ map.label }}
            </option>
          </select>
        </FormElement>
        <span v-if="selectedMap" class="text-sm text-gray-600">
          {{ selectedMap.description }}
        </span>
      </div>

      <FormElement
        v-for="(option, optionKey) in standardOptions"
        :key="optionKey"
        :title="`option_${optionKey}`"
        :label="option.description"
        :required="option.required"
      >
        <PageServicesMappingTransformationsOptionInput
          v-model="data[optionKey]"
          :option-definition="option"
        />
      </FormElement>
    </div>

    <template v-if="selectedMap">
      <div class="grid">
        <span> Data Map </span>
        <div class="max-h-96 overflow-y-auto">
          <LegacyPageSettingsTransformMapValueEditor
            v-for="mapValuePair in selectedMap.map_values"
            :key="mapValuePair.id"
            class="mb-2"
            :left-value="mapValuePair.left_value"
            :right-value="mapValuePair.right_value"
            :allow-editing="false"
          />
        </div>

        <div>
          <UiMessage icon="info">
            To create or modify a transform map, go to
            <NuxtLink
              :to="{
                name: 'settings-transform-maps-transformMapId',
                params: { transformMapId: data.map_id },
              }"
              target="_blank"
            >
              Transform Map Settings
            </NuxtLink>
          </UiMessage>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';

export default {
  name: 'MapFunctionSettings',

  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    functDefinition: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      errors: {},
    };
  },

  async fetch() {
    this.setInitialFunctionData();
    await this.loadMaps();
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      maps: 'mapPresets',
    }),

    data: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.setChildHasUnsavedChanges(true);
        this.$emit('update:modelValue', value);
      },
    },

    mapsLoaded() {
      return this.maps.length > 1;
    },

    allOptions() {
      return this.functDefinition.attributes.options;
    },

    standardOptions() {
      const optionsNewObject = Object.assign({}, this.allOptions);
      delete optionsNewObject.map_id;
      delete optionsNewObject.direction;
      return optionsNewObject;
    },

    optionsDefaultValue() {
      const optionNameWithDefault = {};
      Object.entries(this.allOptions).forEach(([optionName, definition]) => {
        optionNameWithDefault[optionName] = definition.default ?? null;
      });
      return optionNameWithDefault;
    },

    currentCompanyId() {
      return this.$auth.user.company_id ?? 0;
    },

    mapsForSelect() {
      return this.maps.map((mapData) => {
        return {
          id: mapData.id,
          label: mapData.name,
          description: mapData.description,
          map_values: mapData.map_values,
        };
      });
    },

    selectedMap() {
      return this.mapsForSelect.find(
        (map) => parseInt(map.id) === parseInt(this.data.map_id)
      );
    },
  },

  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'storeMapPresets',
      'addMapPresets',
      'setChildHasUnsavedChanges',
    ]),

    /**
     * Set up the object to store the values of the options
     */
    setInitialFunctionData() {
      // set keys for data
      this.setKeysForFieldValues(this.allOptions);

      // populate with any existing values from the parent
      this.data = Object.assign({}, this.data, this.value);
    },

    /**
     * Pass the definitions of a set of fields (eg options, additional_inputs)
     * And the data property where the field values will be stored
     * Adds a key for each field to the data property, which value is stored under
     *
     * @param fieldDefinitions Object: Object containing the definition for each field
     * @param propertyName String: Name of the property to add keys to - will be used to store the field values
     */
    setKeysForFieldValues(fieldDefinitions, propertyName) {
      const fieldKeys = Object.keys(fieldDefinitions);
      const newFieldValues = fieldKeys.reduce((acc, curr) => {
        acc[curr] = null;
        return acc;
      }, {});
      this[propertyName] = Object.assign({}, newFieldValues);
    },

    async loadMaps() {
      this.storeMapPresets(
        await fetchAllPaginatedResults(
          this.$axios,
          `/api/api/v1/transform-scripts/company/${this.currentCompanyId}/maps`,
          {
            include: 'mapValues',
          }
        )
      );
    },
  },
};
</script>
