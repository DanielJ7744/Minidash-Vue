<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error || dataLoadError"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div class="flex items-start">
      <div class="flex-grow text-left">
        <h1 id="main" class="text-xl">Advanced Field Mapping</h1>
        <h2 class="text-lg text-gray-500">
          {{ description }}
        </h2>
      </div>

      <div class="min-w-max text-right">
        <button class="button button-secondary" @click="onDebugClick">
          Toggle Debug Mode
        </button>
        <button
          class="button button-secondary"
          @click="
            navigateTo({
              name: 'connections-connectionId-services-serviceId-mapping',
              params: { connectionId: connector.id, serviceId: service.id },
            })
          "
        >
          Back to UI Mapping
        </button>
        <button
          :disabled="saving"
          class="button button-primary"
          @click="saveChanges()"
        >
          {{ saveButtonText }}
        </button>
      </div>
    </div>

    <div v-if="debug.enabled" class="rounded border-2 border-red-500 px-6 py-4">
      <div class="grid grid-cols-2 gap-x-4">
        <div class="flex flex-col gap-4">
          <div class="form-item">
            <label class="form-item__label"
              >From Mapping Name (including company)</label
            >
            <input
              v-model="debug.cloneFromMappingFullName"
              type="text"
              class="form-item__input"
              placeholder="Enter the full mapping name here or leave blank"
            />
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="form-item">
            <label class="form-item__label"
              >To Mapping Name (including company)</label
            >
            <input
              v-model="debug.cloneToMappingFullName"
              type="text"
              class="form-item__input"
              placeholder="Enter the full mapping name here or leave blank"
            />
          </div>
        </div>
      </div>
      <div class="mt-4">
        <button class="button button--primary" @click="cloneMappings()">
          Clone Mappings
        </button>
      </div>
    </div>

    <div class="grid grid-cols-4 items-center">
      <UiMediaBlock
        :inverted="true"
        :image="getSystemImage(fromSystem)"
        :title="getSystemTitle(fromSystem)"
      >
        Source
      </UiMediaBlock>
      <div>
        <button
          v-if="editSource"
          type="button"
          class="button button-secondary"
          @click="editSource = false"
        >
          Stop Editing Source
        </button>
      </div>
      <UiMediaBlock
        :inverted="true"
        :image="getSystemImage(toSystem)"
        :title="getSystemTitle(toSystem)"
      >
        Destination
      </UiMediaBlock>
      <div>
        <button
          v-if="editDestination"
          type="button"
          class="button button-secondary"
          @click="editDestination = false"
        >
          Stop Editing Destination
        </button>
      </div>
    </div>

    <div v-if="dataLoadError" class="message message--fail">
      <span class="icon icon--warning" />
      {{ dataLoadErrorMessage }}
    </div>

    <div
      v-else-if="originalFromMapData && originalToMapData"
      :class="{ 'opacity-50': saving }"
    >
      <div class="grid min-h-screen grid-cols-2">
        <div v-if="loadedDefaultOrEmptySource && !editSource">
          <UiMessage type="fail">
            <p>
              Only a default or empty mapping file could be loaded for the
              source.
            </p>
            <p>Please click the button below if you want to edit this.</p>
            <p>
              If you edit this, you must complete this mapping file as saving
              this will overwrite anything currently saved.
            </p>
            <template #buttons>
              <div class="flex justify-center">
                <button
                  type="button"
                  class="button button-danger"
                  @click="editSource = true"
                >
                  Edit Mapping File
                </button>
              </div>
            </template>
          </UiMessage>
        </div>

        <JsonEditor
          v-model="originalFromMapData"
          :display-back-link="false"
          :use-position-classes="false"
          hide-button
        />

        <div
          v-if="loadedDefaultOrEmptyDestination && !editDestination && toSystem"
        >
          <UiMessage type="fail">
            <p>
              Only a default or empty mapping file could be loaded for the
              destination.
            </p>
            <p>Please click the button below if you want to edit this.</p>
            <p>
              If you edit this, you must complete this mapping file as saving
              this will overwrite anything currently saved.
            </p>
            <template #buttons>
              <div class="flex justify-center">
                <button
                  type="button"
                  class="button button-danger"
                  @click="editDestination = true"
                >
                  Edit Mapping File
                </button>
              </div>
            </template>
          </UiMessage>
        </div>
        <div
          v-else-if="
            loadedDefaultOrEmptyDestination && !editDestination && !toSystem
          "
        >
          <UiMessage type="fail">
            <p>A destination system is missing from this service.</p>
            <p>
              A mapping file cannot be added to the push side because of this.
            </p>
          </UiMessage>
        </div>
        <JsonEditor
          v-model="originalToMapData"
          :display-back-link="false"
          :use-position-classes="false"
          hide-button
        />
      </div>
    </div>

    <UiLoading v-else label="Loading Data..." />
  </div>
</template>

<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import { mappingHelperMixin } from '@/mixins/mapping-helper-mixin';
import { getMapping } from '@/lib/mapping';
import { showError } from '@/lib/api/error';

export default {
  name: 'DataMapping',
  filters: {
    pretty(value) {
      return JSON.stringify(value, null, 2);
    },
  },
  mixins: [systemsHelperMixin, mappingHelperMixin],
  props: {
    service: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
    connector: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dataLoadError: false,
      dataLoadErrorMessage: '',
      saving: false,
      saveButtonText: 'Save Changes',
      debug: {
        enabled: false,
        cloneFromMappingFullName: '',
        cloneToMappingFullName: '',
      },
      loadedDefaultOrEmptySource: false,
      loadedDefaultOrEmptyDestination: false,
      editSource: false,
      editDestination: false,
    };
  },
  async fetch() {
    this.dataLoadError = false;

    if (this.service.from_mapping) {
      try {
        this.originalFromMapData = await getMapping(
          this.$axios,
          `${this.username}_${this.service.from_mapping}`
        ).then((r) => JSON.parse(r.data.content));
      } catch (error) {
        this.originalFromMapData = {};
      }
    }

    if (this.service.to_mapping) {
      try {
        const response = await getMapping(
          this.$axios,
          `${this.username}_${this.service.to_mapping}`
        ).then((r) => r.data);
        this.originalToMapData = JSON.parse(response.content);
      } catch (error) {
        this.originalToMapData = {};
      }
    }

    if (Object.keys(this.originalFromMapData).length === 0) {
      if (this.service?.source_factory_system?.default_map_name) {
        try {
          this.originalFromMapData = await getMapping(
            this.$axios,
            this.service.source_factory_system.default_map_name
          ).then((r) => JSON.parse(r.data.content));
        } catch (error) {
          this.originalFromMapData = {};
        }
      }
      this.loadedDefaultOrEmptySource = true;
    }

    if (Object.keys(this.originalToMapData).length === 0) {
      if (this.service?.destination_factory_system?.default_map_name) {
        try {
          this.originalToMapData = await getMapping(
            this.$axios,
            this.service.destination_factory_system.default_map_name
          ).then((r) => JSON.parse(r.data.content));
        } catch (error) {
          this.originalToMapData = {};
        }
      }
      this.loadedDefaultOrEmptyDestination = true;
    }
  },
  computed: {
    description() {
      return this.service.description ?? 'No description provided';
    },
    fromSystem() {
      return this.service.source_system;
    },
    toSystem() {
      return this.service.destination_system;
    },
    username() {
      return this.service.username;
    },
  },
  methods: {
    getSystemImage(system) {
      return getSystemLogo(system ? system.name : null);
    },
    getSystemTitle(system) {
      return system && system.name ? system.name : 'Patchworks';
    },
    onDebugClick() {
      this.debug.enabled = !this.debug.enabled;
    },
    cloneMappings() {
      if (
        !this.debug.cloneFromMappingFullName &&
        !this.debug.cloneToMappingFullName
      ) {
        this.$toast.error("I don't know what you expect from me");
        return;
      }
      Promise.all([
        getMapping(this.$axios, this.debug.cloneFromMappingFullName),
        getMapping(this.$axios, this.debug.cloneToMappingFullName),
      ])
        .then((mappingResponses) => {
          if (mappingResponses[0]) {
            this.originalFromMapData = JSON.parse(
              mappingResponses[0].data.content
            );
          }
          if (mappingResponses[1]) {
            this.originalToMapData = JSON.parse(
              mappingResponses[1].data.content
            );
          }
          this.$toast.success('Mapping copied from source');
        })
        .catch((e) => {
          showError(this.$notify, e, 5000);
        });
    },
    saveChanges() {
      this.commitChanges(this.originalFromMapData, this.originalToMapData);
    },
    async commitChanges(sourceMapping, destinationMapping) {
      this.saving = true;
      this.saveButtonText = 'Saving...';

      if (
        (!this.loadedDefaultOrEmptySource &&
          !this.loadedDefaultOrEmptyDestination) ||
        (this.loadedDefaultOrEmptySource && this.editSource) ||
        (this.loadedDefaultOrEmptyDestination && this.editDestination)
      ) {
        // Attempt to save both mapping files
        Promise.all([
          this.saveMapping(
            this.integration,
            this.getMappingNameFromService(this.service, 'from'),
            sourceMapping
          ),
          this.saveMapping(
            this.integration,
            this.getMappingNameFromService(this.service, 'to'),
            destinationMapping
          ),
        ])
          .then(() => {
            // If the service from/to mapping are null then update the
            // service with the new references
            this.updateService();
          })
          .catch((error) => {
            console.error(error);
            showError(this.$notify, error, 5000);
          });
      }

      if (this.loadedDefaultOrEmptySource && !this.editSource) {
        await this.saveMapping(
          this.integration,
          this.getMappingNameFromService(this.service, 'to'),
          destinationMapping
        )
          .then(() => {
            this.updateService();
          })
          .catch((error) => {
            console.error(error);
            showError(this.$notify, error, 5000);
          });
      }

      if (this.loadedDefaultOrEmptyDestination && !this.editDestination) {
        await this.saveMapping(
          this.integration,
          this.getMappingNameFromService(this.service, 'from'),
          sourceMapping
        )
          .then(() => {
            this.updateService();
          })
          .catch((error) => {
            console.error(error);
            showError(this.$notify, error, 5000);
          });
      }
    },
    async updateService() {
      await this.updateServiceMappingReferences(
        this.service.id,
        this.getMappingNameFromService(this.service, 'from'),
        this.getMappingNameFromService(this.service, 'to')
      );
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Mapping successfully saved',
        },
        4000
      );
      this.saveSuccessful();
    },
    saveSuccessful() {
      this.saving = false;
      this.saveButtonText = 'Save Changes';
    },
  },
};
</script>
