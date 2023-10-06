<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <form v-else @submit.prevent="saveMap">
    <UiTitledCard title="General">
      <FormElement
        v-model="form.name"
        required
        title="name"
        label="Name"
        :errors="errors"
        :disabled="!allowEditing"
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          class="w-full item__input"
          type="text"
          pattern="[a-zA-Z0-9 \-&[\]\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          minlength="3"
          maxlength="255"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>

      <FormElement
        v-model="form.description"
        required
        title="description"
        label="Description"
        :errors="errors"
        :disabled="!allowEditing"
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          class="w-full item__input"
          type="text"
          pattern="[a-zA-Z0-9 \-&[\]\+_]+"
          title="Name must contain alphanumeric, ampersand, dash and space characters only."
          minlength="3"
          maxlength="255"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>

      <FormElement
        v-model="form.default_value"
        required
        title="default_value"
        label="Default Value"
        :errors="errors"
        :disabled="!allowEditing"
        tooltip="Default value will be used if no matching value is found in the map."
        v-slot="{ inputProps, inputEvents }"
      >
        <input
          class="w-full item__input"
          type="text"
          pattern="[a-zA-Z0-9 \-]+"
          title="Default value must only contain alphabetical, numeric, dash and space characters."
          minlength="1"
          maxlength="255"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </FormElement>
    </UiTitledCard>
    <hr />
    <div>
      <div
        class="mb-4 flex justify-between md:flex-row flex-col gap-2"
      >
        <div class="h6 flex items-center">Data Transform Map</div>
        <div class="h6 flex gap-x-2 items-center">
          <button
            type="button"
            class="button button-secondary"
            :disabled="!form.map_values.length && !map?.map_values.length"
            @click="changeMapDirection"
          >
            Swap values
          </button>
        </div>
      </div>
      <div class="p-2">
        <div class="max-h-96 overflow-y-auto">
          <div v-if="map">
            <div
              v-for="(mapValuePair, mapValueIndex) in map.map_values"
              :key="
                mapValueIndex +
                mapValuePair.left_value +
                mapValuePair.right_value
              "
              class="mb-2"
            >
              <LegacyPageSettingsTransformMapValueEditor
                :left-value="mapValuePair.left_value"
                :right-value="mapValuePair.right_value"
                :allow-editing="allowEditing"
                :values-swapped="mapValuePair.values_swapped ?? false"
                @leftValueChanged="
                  addValue($event, mapValueIndex, 'left_value', mapValuePair.id)
                "
                @rightValueChanged="
                  addValue(
                    $event,
                    mapValueIndex,
                    'right_value',
                    mapValuePair.id
                  )
                "
                @removeMapValue="
                  removeExistingMapValue(mapValueIndex, mapValuePair.id)
                "
              />
            </div>
          </div>
          <component
            :is="component.component"
            v-for="(component, componentIndex) in mapEditors"
            :key="componentIndex + component.left_value + component.right_value"
            :allow-editing="allowEditing"
            :left-value="component.left_value"
            :right-value="component.right_value"
            :values-swapped="component.values_swapped ?? false"
            class="mb-2"
            @leftValueChanged="addValue($event, componentIndex, 'left_value')"
            @rightValueChanged="addValue($event, componentIndex, 'right_value')"
            @removeMapValue="removeNewMapValue(componentIndex)"
          />
        </div>
        <div class="flex justify-center items-center mt-4">
          <button
            v-if="allowEditing"
            type="button"
            class="button button-primary"
            @click="addMapEditor()"
          >
            <span class="text-xs icon icon--plus mr-2"></span>
            Add new row
          </button>
        </div>
      </div>
    </div>
    <hr />
    <div class="flex justify-between sm:flex-row flex-col-reverse">
      <div class="w-full sm:w-auto sm:self-auto self-end">
        <button v-if="mapIdToDuplicate" type="button" class="button button-secondary" @click="navigateTo({name: 'settings-transform-maps'})">
          Cancel
        </button>
        <button
          v-if="mapId && allowEditing"
          type="button"
          class="button button-danger w-full"
          @click="deleteMap"
        >
          Delete Transform Map
        </button>
      </div>
      <UiLoading v-if="isMakingRequest" label="Saving map..." />
      <div class="flex flex-end">
        <button
          v-if="allowEditing"
          type="submit"
          class="button button-primary"
        >
          Save Map
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'TransformMapForm',
  props: {
    mapId: {
      type: Number,
      required: false,
      default: null,
    },
    mapIdToDuplicate: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: null,
        description: null,
        default_value: null,
        map_values: [],
      },
      errors: {},
      map: null,
      mapToDuplicate: null,
      mapEditors: [],
      mapValuesToUpdate: [],
      mapValuesToDelete: [],
      isMakingRequest: false,
      addedToUpdatedValues: false,
    };
  },
  async fetch() {
    if (this.mapIdToDuplicate) {
      this.mapToDuplicate = await useFabric(
        `/api/v1/transform-scripts/maps/${this.mapIdToDuplicate}`,
        {
          params: {
            include: 'mapValues',
          },
        }
      ).then((r) => r.data);

      this.form.name = this.mapToDuplicate.name;
      this.form.description = this.mapToDuplicate.description;
      this.form.default_value = this.mapToDuplicate.default_value;
      this.mapToDuplicate.map_values.forEach((mapValuePair) => {
        this.addMapEditor(mapValuePair.left_value, mapValuePair.right_value);
        this.form.map_values.push({
          left_value: mapValuePair.left_value,
          right_value: mapValuePair.right_value,
        });
      });
    }

    if (this.mapId) {
      this.map = await useFabric(
        `/api/v1/transform-scripts/maps/${this.mapId}`,
        {
          params: {
            include: 'mapValues',
          },
        }
      ).then((r) => r.data);

      this.form.name = this.map.name;
      this.form.description = this.map.description;
      this.form.default_value = this.map.default_value;
    }
  },
  computed: {
    allowEditing() {
      return this.map?.company_id !== 0;
    },
  },
  methods: {
    changeMapDirection() {
      if (!this.form.map_values.length && !this.map?.map_values.length) {
        return;
      }

      this.changeMapValueDirections();
    },
    changeMapValueDirections() {
      // update map values to be updated
      if (this.mapValuesToUpdate.length) {
        this.mapValuesToUpdate = this.mapValuesToUpdate.map((mapValue) => {
          return this.changeMapValueSides(mapValue);
        });
      }
      // swap sides for loaded values and prep for update
      if (
        this.map &&
        this.map?.map_values.length &&
        !this.addedToUpdatedValues
      ) {
        const adjustedMapValues = this.map.map_values.map((mapValue) => {
          return this.changeMapValueSides(mapValue);
        });

        this.mapValuesToUpdate =
          this.mapValuesToUpdate.concat(adjustedMapValues);
        this.addedToUpdatedValues = true;
      }
      // swap sides for newly entered values
      if (this.form.map_values.length) {
        this.form.map_values = this.form.map_values.map((mapValue) => {
          return this.changeMapValueSides(mapValue);
        });
      }
    },
    changeMapValueSides(mapValue) {
      const leftSide = mapValue.right_value;
      const rightSide = mapValue.left_value;
      mapValue.left_value = leftSide;
      mapValue.right_value = rightSide;
      mapValue.values_swapped = true;

      return mapValue;
    },
    addMapEditor(leftValue = null, rightValue = null) {
      const transformMapValueEditor = resolveComponent(
        'LegacyPageSettingsTransformMapValueEditor'
      );

      this.mapEditors.push({
        id: Math.random().toString(36).substring(2, 15),
        component: transformMapValueEditor,
        left_value: leftValue,
        right_value: rightValue,
      });
    },
    async saveMap() {
      if (!this.allowEditing) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'You are not allowed to save/update this map',
          },
          4000
        );
        return;
      }

      this.isMakingRequest = true;
      try {
        this.mapId ? await this.updateMap() : await this.createMap();

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved transform map',
          },
          4000
        );

        navigateTo({ name: 'settings-transform-maps' });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving map: ${error}`,
          },
          4000
        );
        if (this.mapId) {
          navigateTo({
            name: 'settings-transform-maps-transformMapId',
            params: {
              transformMapId: this.mapId,
            },
          });
        }
      }
      this.isMakingRequest = false;
    },
    async createMap() {
      this.map = await useFabric('/api/v1/transform-scripts/maps', {
        method: 'POST',
        body: this.form,
      }).then((r) => r.data);
    },
    async updateMap() {
      await this.sendUpdateMapValueRequest();
      this.map = await useFabric(
        `/api/v1/transform-scripts/maps/${this.mapId}`,
        {
          method: 'PATCH',
          body: this.form,
        }
      ).then((r) => r.data);
    },
    async deleteMap() {
      if (!window.confirm('Are you sure you want to delete this data map?')) {
        return;
      }
      this.isMakingRequest = true;
      try {
        await useFabric(`/api/v1/transform-scripts/maps/${this.mapId}`, {
          method: 'DELETE',
        });

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted transform map',
          },
          4000
        );

        navigateTo({ name: 'settings-transform-maps' });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving map: ${error}`,
          },
          4000
        );
      }
      this.isMakingRequest = false;
    },
    async sendUpdateMapValueRequest() {
      let promisesToResolve = [];
      if (this.mapValuesToDelete.length) {
        this.mapValuesToDelete.forEach((mapValueId) => {
          if (!mapValueId) {
            return;
          }
          promisesToResolve.push(
            useFabric(
              `/api/v1/transform-scripts/maps/${this.mapId}/values/${mapValueId}`,
              { method: 'DELETE' }
            )
          );
        });
      }

      if (this.form.map_values.length) {
        promisesToResolve = promisesToResolve.concat(
          this.form.map_values.map((mapValue) => {
            return useFabric(
              `/api/v1/transform-scripts/maps/${this.mapId}/values`,
              { method: 'POST', body: mapValue }
            );
          })
        );
      }

      if (this.mapValuesToUpdate) {
        promisesToResolve = promisesToResolve.concat(
          this.mapValuesToUpdate.map((mapValue) => {
            return useFabric(
              `/api/v1/transform-scripts/maps/${this.mapId}/values/${mapValue.id}`,
              { method: 'PATCH', body: mapValue }
            );
          })
        );
      }

      if (!promisesToResolve.length) {
        return;
      }

      await Promise.all(promisesToResolve);
    },
    addValue(
      event,
      index,
      valueSide,
      mapValueId = null,
      mapDirectionChanged = false
    ) {
      valueSide = this.getValueSide(mapDirectionChanged, valueSide);
      if (mapValueId === null) {
        if (this.form.map_values[index] !== undefined) {
          this.form.map_values[index][valueSide] = event;
          return;
        }
        this.form.map_values[index] = { [valueSide]: event };
        return;
      }
      if (this.mapValuesToUpdate[index] !== undefined) {
        this.mapValuesToUpdate[index][valueSide] = event;
        return;
      }
      this.mapValuesToUpdate[index] = { [valueSide]: event, id: mapValueId };
    },
    getValueSide(mapDirectionChanged, valueSide) {
      if (mapDirectionChanged === true) {
        if (valueSide === 'left_value') {
          return 'right_value';
        }
        if (valueSide === 'right_value') {
          return 'left_value';
        }
      }
      return valueSide;
    },
    removeExistingMapValue(index, mapValueId) {
      this.mapValuesToDelete[index] = mapValueId;
      if (this.mapValuesToUpdate[index] !== undefined) {
        this.mapValuesToUpdate.splice(index, 1);
      }
      this.map.map_values.splice(index, 1);
    },
    removeNewMapValue(index) {
      if (this.form.map_values[index] !== undefined) {
        this.form.map_values.splice(index, 1);
      }
      this.mapEditors.splice(index, 1);
    },
  },
};
</script>
