<template>
  <UiLoading v-if="$fetchState.pending || saving" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <UiMessage
      v-if="dataLoadError"
      type="notice"
      icon="alert"
      header="Cannot Edit Mapping"
      :centre-message="true"
    >
      <p>
        These mappings can only be edited by a member of the Patchworks team -
        please raise a ticket in your support portal for assistance.
      </p>

      <div v-if="$patchworks()" class="flex justify-center">
        <button
          v-if="$can('json editor')"
          class="button button-primary"
          @click="
            navigateTo({
              name: 'connections-connectionId-services-serviceId-advanced-mapping',
              params: {
                connectionId: route.params.connectionId,
                serviceId: route.params.serviceId,
              },
            })
          "
        >
          Proceed to JSON editor
        </button>
      </div>
      <div v-else class="flex justify-center">
        <NuxtLink
          href="https://gopatchworks.zendesk.com/hc/en-gb"
          target="_blank"
          rel="noopener"
        >
          <button type="button" class="button button-primary">
            Go to Support Portal
          </button>
        </NuxtLink>
      </div>
    </UiMessage>

    <div v-else>
      <PageHeader>
        <template #title>
          Field Mapping
          <span v-if="debug.enabled"> (Debug Mode) </span>
        </template>
        <template #description>
          {{ description }}
        </template>
        <template v-if="!readOnlyMode" #actions>
          <div class="grid grid-cols-2 gap-1">
            <button
              type="button"
              class="button button-secondary"
              :disabled="!dirty || saving"
              @click="revertChanges"
            >
              Revert All
            </button>
            <button
              type="button"
              class="button button-primary"
              :disabled="disableSaveButton"
              @click="saveChanges"
            >
              {{ saveButtonText }}
            </button>
            <template v-if="$patchworks()">
              <button
                type="button"
                class="button button-secondary"
                @click="
                  navigateTo({
                    name: 'connections-connectionId-services-serviceId-advanced-mapping',
                    params: {
                      connectionId: route.params.connectionId,
                      serviceId: route.params.serviceId,
                    },
                  })
                "
              >
                Advanced Editor
              </button>
              <button
                type="button"
                class="button button-secondary"
                @click="onDebugClick"
              >
                Toggle Debug Mode
              </button>
            </template>
          </div>
        </template>
      </PageHeader>

      <UiMessage
        v-if="readOnlyMode"
        type="info"
        icon="info"
        header="Read-only Mode"
        class="mb-4"
      >
        This mapping is currently being viewed in read-only mode. Editing
        functions are not available.
      </UiMessage>

      <div
        v-if="debug.enabled && mappingRows"
        class="grid grid-cols-3 gap-x-4 rounded border-2 border-red-500 px-6 py-4"
      >
        <div class="flex flex-col gap-4">
          <div class="form-item">
            <label class="form-item__label"
              >Full Mapping Name (including company)</label
            >
            <input
              v-model="debug.cloneMappingFullName"
              type="text"
              class="form-item__input"
            />
          </div>
          <div class="form-item">
            <label class="form-item__label">Clone To</label>
            <select v-model="debug.cloneMappingTarget" class="form-item__input">
              <option value="from_mapping">Source Mapping</option>
              <option value="to_mapping">Destination Mapping</option>
            </select>
          </div>
          <button class="button button--primary" @click="cloneMapping()">
            Clone Mapping
          </button>
          <button class="button button--primary" @click="saveOriginalMapping()">
            Save Original Mapping
          </button>
          <button class="button button--primary" @click="explodeMappings()">
            Force Explode &gt;
          </button>
          <button class="button button--primary" @click="implodeMappings()">
            &lt; Force Implode
          </button>
        </div>
        <table class="col-span-2 table-fixed">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">From</th>
              <th scope="col">To</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Original</th>
              <td>
                <textarea
                  readonly
                  :value="pretty(originalFromMapData)"
                  class="w-full"
                />
              </td>
              <td>
                <textarea
                  readonly
                  :value="pretty(originalToMapData)"
                  class="w-full"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Mapping Rows</th>
              <td colspan="2">
                <textarea
                  readonly
                  :value="pretty(mappingRows)"
                  class="w-full"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">New</th>
              <td>
                <textarea
                  readonly
                  :value="pretty(newFromMapData)"
                  class="w-full"
                />
              </td>
              <td>
                <textarea
                  readonly
                  :value="pretty(newToMapData)"
                  class="w-full"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="scrollbar-none grid grid-cols-2 gap-2 overflow-x-auto py-2">
        <UiMediaBlock
          :inverted="true"
          :image="getSystemImage(fromSystem)"
          :title="getSystemTitle(fromSystem)"
          :small-text="true"
        >
          Source
        </UiMediaBlock>
        <UiMediaBlock
          :inverted="true"
          :image="getSystemImage(toSystem)"
          :title="getSystemTitle(toSystem)"
          :small-text="true"
        >
          Destination
        </UiMediaBlock>
      </div>

      <UiLoading v-if="!mappingRows" label="Loading Data..." />

      <div v-if="requiredBrokenRows.length" :class="{ 'opacity-50': saving }">
        <h4 class="mb-0.5 rounded bg-gray-200 p-2 text-sm">
          Rows missing required source fields
        </h4>
        <PageServicesMappingLine
          v-for="brokenRow in requiredBrokenRows"
          :key="brokenRow.rowId"
          :mapping-row="brokenRow"
          :debug="debug.enabled"
          :read-only-mode="readOnlyMode"
          :from-schema="fromSchemaTree"
          :to-schema="toSchemaTree"
          :show-transform-button="showTransformButton"
          class="border-danger-500 border"
          @row-deleted="deleteMappingRow($event)"
          @row-updated="updateMappingRow($event)"
          @edit-status-change="onRowEditStatusChange($event)"
        />
      </div>

      <div v-if="collectedMappingRows" :class="{ 'opacity-50': saving }">
        <div
          v-for="[rowGroupName, entries] in Object.entries(
            collectedMappingRows.items
          )"
          :key="rowGroupName"
          class="mb-2 text-sm"
        >
          <h4 class="mb-0.5 rounded bg-gray-200 p-2 capitalize">
            {{ formatMappingGroupName(rowGroupName) }}
          </h4>
          <PageServicesMappingLine
            v-for="mappingRow in entries"
            :key="mappingRow.rowId + 'normalList'"
            :mapping-row="mappingRow"
            :debug="debug.enabled"
            :read-only-mode="readOnlyMode"
            :from-schema="fromSchemaTree"
            :to-schema="toSchemaTree"
            :show-transform-button="showTransformButton"
            @row-deleted="deleteMappingRow($event)"
            @row-updated="updateMappingRow($event)"
            @edit-status-change="onRowEditStatusChange($event)"
          />
        </div>
      </div>

      <div
        v-if="newMappingRows.length"
        :class="{ 'opacity-50': saving }"
        class="mb-2 text-sm"
      >
        <h4 class="mb-0.5 rounded bg-gray-200 p-2">New</h4>
        <PageServicesMappingLine
          v-for="newMappingRow in newMappingRows"
          :key="newMappingRow.rowId + 'newList'"
          :mapping-row="newMappingRow"
          :debug="debug.enabled"
          :read-only-mode="readOnlyMode"
          :from-schema="fromSchemaTree"
          :to-schema="toSchemaTree"
          :show-transform-button="showTransformButton"
          @row-deleted="deleteMappingRow($event)"
          @row-updated="updateMappingRow($event)"
          @edit-status-change="onRowEditStatusChange($event)"
        />
      </div>

      <button
        v-if="mappingRows"
        type="button"
        class="button button-primary button-lg mb-4 w-full"
        @click="addMappingRow"
      >
        Add new row
      </button>

      <div
        v-if="debug.enabled && brokenMappingRows.length > 0"
        class="opacity-70"
      >
        <h4 class="mb-0.5 rounded bg-gray-200 p-2 text-gray-500">
          (Debug) One-sided fields
        </h4>
        <PageServicesMappingLine
          v-for="(mappingRow, index) in brokenMappingRows"
          :key="mappingRow.rowId"
          :mapping-row="mappingRow"
          :debug="debug.enabled"
          :from-schema="fromSchemaTree"
          :to-schema="toSchemaTree"
          :show-transform-button="showTransformButton"
          @row-deleted="deleteMappingRow(index)"
        />
      </div>

      <div class="min-w-max text-right">
        <button
          :disabled="!dirty || saving"
          class="button button-secondary"
          @click="revertChanges()"
        >
          Revert All
        </button>
        <button
          :disabled="disableSaveButton"
          class="button button-primary"
          @click="saveChanges()"
        >
          {{ saveButtonText }}
        </button>
      </div>
      <Modal
        id="transformationEditor"
        title="Transformation Editor"
        size="lg"
        @modal-closed="onModalClose"
      >
        <PageServicesMappingTransformationsEditor />
      </Modal>
      <Modal id="saveWarning" title="Unable to Save" size="md">
        <div>
          Please go through and ensure that all mapping rows with required
          fields are populated and that all edits are completed.
        </div>
        <div v-if="requiredBrokenRows.length">
          There are currently {{ requiredBrokenRows.length }} that need
          populating.
        </div>
        <div class="flex justify-center">
          <button
            type="button"
            class="button button-secondary"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import clone from 'just-clone';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import { mappingHelperMixin } from '@/mixins/mapping-helper-mixin';
import { schemaHelperMixin } from '@/mixins/schema-helper-mixin';
import { goToNextSetupStep } from '@/lib/serviceSetup';
import { getMapping } from '@/lib/mapping';
import { showError } from '@/lib/api/error';

export default {
  name: 'Mapping',
  mixins: [systemsHelperMixin, schemaHelperMixin, mappingHelperMixin],
  props: {
    service: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      dataLoadError: false,
      debug: {
        enabled: false,
        cloneMappingTarget: 'from_mapping',
        cloneMappingFullName: '',
      },
      saving: false,
      readOnlyMode: false,
      rowsInEdit: [],
      rowIds: {},
      rowDeleted: false,
    };
  },
  async fetch() {
    if (!this.canLoadUIMap) {
      this.dataLoadError = true;
      return;
    }
    // Already got them
    // (and you can't change system or entity types from this page)
    if (!this.fromSchema && !this.toSchema) {
      await this.getSchemas(
        this.service.service_template?.source_factory_system ??
          this.service.source_factory_system,
        this.service.service_template?.destination_factory_system ??
          this.service.destination_factory_system
      );
    }

    this.dataLoadError = false;
    if (!this.service.from_mapping && !this.service.to_mapping) {
      this.clearMapping();
      return;
    }

    await Promise.all([
      getMapping(this.$axios, `${this.username}_${this.service.from_mapping}`),
      getMapping(this.$axios, `${this.username}_${this.service.to_mapping}`),
    ])
      .then((mappingResponses) => {
        this.originalFromMapData = JSON.parse(mappingResponses[0].data.content);
        this.originalToMapData = JSON.parse(mappingResponses[1].data.content);

        this.explodeMappings();
      })
      .catch((e) => {
        this.dataLoadError = true;
        console.error(e);
      });

    // load transform function definitions so are ready ahead of time
    if (this.showTransformButton) {
      await this.setFunctionDefinitions();
    }
  },
  computed: {
    saveButtonText() {
      if (this.saving) {
        return 'Saving...';
      }
      return this.isNewService ? 'Next' : 'Save Changes';
    },
    description() {
      return this.service.description ?? 'No description provided';
    },
    fromSystem() {
      return this.service.source_system;
    },
    toSystem() {
      return this.service.destination_system;
    },
    canLoadUIMap() {
      return (
        !!this.fromSystem &&
        !!this.toSystem &&
        !!this.service.source_factory_system &&
        !!this.service.destination_factory_system
      );
    },
    username() {
      return this.service.username;
    },
    isNewService() {
      return this.route.query.path === 'new';
    },
    serviceIsOnK8s() {
      const integrationServer = this.integration?.server;
      if (integrationServer) {
        return (
          integrationServer.includes('-k8s') ||
          integrationServer.includes('-uat')
        );
      }
      return false;
    },
    showTransformButton() {
      return this.serviceIsOnK8s;
    },
    hasNewRow() {
      return (
        this.mappingRows.filter((row) => row.isNew && row.isNew === true)
          .length > 0
      );
    },
    hasRowInEdit() {
      return this.rowsInEdit.length > 0;
    },
    disableSaveButton() {
      return !this.dirty || this.saving;
    },
    shouldShowSaveWarning() {
      return (
        this.hasNewRow ||
        this.hasRowInEdit ||
        this.requiredBrokenRows.length > 0
      );
    },
    dirty() {
      return (
        this.mappingRows.some((row) => row.edited ?? false) || this.rowDeleted
      );
    },
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, [
      'discardTransformationEdits',
      'setFunctionDefinitions',
    ]),
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    getSystemImage(system) {
      return getSystemLogo(system ? system.name : null);
    },
    getSystemTitle(system) {
      return system && system.name ? system.name : 'Patchworks';
    },
    async saveOriginalMapping() {
      this.newFromMapData = clone(this.originalFromMapData);
      this.newToMapData = clone(this.originalToMapData);

      await this.commitMapping(this.newFromMapData, this.newToMapData);
    },
    async saveChanges() {
      if (!this.dirty && this.isNewService) {
        goToNextSetupStep(
          'alerts',
          this.route.params.connectionId,
          this.route.params.serviceId
        );

        return;
      }

      if (this.shouldShowSaveWarning) {
        this.openModal('saveWarning');
        return;
      }

      this.implodeMappings();

      await this.commitMapping(this.newFromMapData, this.newToMapData);
    },
    async commitMapping(sourceMapping, destinationMapping) {
      this.saving = true;

      // Attempt to save both mapping files
      await Promise.all([
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
          if (
            !this.service.from_mapping ||
            !this.service.to_mapping ||
            this.getMappingNameFromService(this.service, 'from') !==
              this.service.from_mapping ||
            this.getMappingNameFromService(this.service, 'to') !==
              this.service.to_mapping
          ) {
            this.updateServiceMappingReferences(
              this.service.id,
              this.getMappingNameFromService(this.service, 'from'),
              this.getMappingNameFromService(this.service, 'to')
            ).then((response) => {
              this.saveSuccessful();
            });
          } else {
            this.saveSuccessful();
          }
        })
        .catch((error) => {
          console.error(error);
          showError(this.$notify, error, 5000);
        });
    },
    saveSuccessful() {
      this.originalFromMapData = clone(this.newFromMapData);
      this.originalToMapData = clone(this.newToMapData);

      this.explodeMappings();
      this.saving = false;
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Mapping successfully updated',
        },
        4000
      );

      if (this.isNewService) {
        goToNextSetupStep(
          'alerts',
          this.route.params.connectionId,
          this.route.params.serviceId
        );
      }
    },
    cloneMapping() {
      getMapping(this.$axios, this.debug.cloneMappingFullName)
        .then((response) => {
          if (this.debug.cloneMappingTarget === 'from_mapping') {
            this.originalFromMapData = JSON.parse(response.data.content);
          } else {
            this.originalToMapData = JSON.parse(response.data.content);
          }

          this.explodeMappings();

          this.$toast.success('Mapping copied from source');
        })
        .catch((error) => {
          showError(this.$notify, error, 5000);
        });
    },
    revertChanges() {
      this.explodeMappings();

      this.$notify(
        {
          group: 'notifications',
          type: 'info',
          text: 'Your changes have been reverted',
        },
        4000
      );
    },
    onRowEditStatusChange(event) {
      const existingIndex = this.rowsInEdit.findIndex(
        (row) => row.rowId === event.rowId
      );
      if (event.editing === false) {
        if (existingIndex !== -1) {
          // delete the rowId from the 'rowsInEdit' array
          this.rowsInEdit.splice(existingIndex, 1);
        }
        return;
      }
      if (existingIndex !== -1) {
        // remove existing row first if there is one
        this.rowsInEdit.splice(existingIndex, 1);
      }
      if (event.path && !Object.values(this.rowIds).includes(event.path)) {
        this.rowIds[event.rowId] = event.path;
      }
      // add the rowId to the rowsInEdit array
      this.rowsInEdit.push(event);
    },
    onDebugClick() {
      this.debug.enabled = !this.debug.enabled;
    },
    onModalClose() {
      // discard edits on modal close - this is used when the 'x' button in the modal is clicked
      this.discardTransformationEdits();
    },
    formatMappingGroupName(name) {
      return name.replace('_', ' ');
    },
  },
};
</script>
