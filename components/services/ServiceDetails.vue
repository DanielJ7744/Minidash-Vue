<template>
  <div class="grid grid-cols-1 gap-y-2">
    <template v-if="!editorToDisplay">
      <div v-if="!mutableService.status">
        <span class="icon icon--warning" />
        &nbsp;This service is currently disabled
      </div>

      <div>
        <span class="h6">Service Information</span>
        <UiDataList class="bg-gray-50 p-3" :items="serviceInformation" />
      </div>

      <div>
        <span class="h6">Integration Information</span>
        <UiDataList class="bg-gray-50 p-3" :items="integrationInformation" />
      </div>

      <div v-if="mutableService.source_filter_template">
        <span class="h6">Filter Template Information</span>
        <UiDataList
          class="bg-gray-50 p-3"
          :items="sourceFilterTemplateInformation"
        />
      </div>

      <div
        v-if="$patchworks() && !mutableService.source_connector"
        class="grid grid-cols-2 gap-2"
      >
        <div
          @click="editFromOptions"
          class="flex cursor-pointer items-center gap-x-2 p-2 hover:rounded-sm hover:border hover:border-gray-200"
        >
          <div class="icon icon--pencil" />
          <div>Edit Source Options</div>
        </div>
        <div
          @click="editToOptions"
          class="flex cursor-pointer items-center gap-x-2 p-2 hover:rounded-sm hover:border hover:border-gray-200"
        >
          <div class="icon icon--pencil" />
          <div>Edit Destination Options</div>
        </div>
        <div
          @click="editFromMapping"
          class="flex cursor-pointer items-center gap-x-2 p-2 hover:rounded-sm hover:border hover:border-gray-200"
        >
          <div class="icon icon--pencil" />
          <div>Edit Source Mapping</div>
        </div>
        <div
          @click="editToMapping"
          class="flex cursor-pointer items-center gap-x-2 p-2 hover:rounded-sm hover:border hover:border-gray-200"
        >
          <div class="icon icon--pencil" />
          <div>Edit Destination Mapping</div>
        </div>
      </div>
    </template>

    <json-editor
      v-if="editorToDisplay === 'options'"
      v-model="jsonEditorData"
      back-text="Return to settings"
      :display-back-link="true"
      @go-back="goBack"
      @update="updateOptions"
    />

    <json-editor
      v-if="editorToDisplay === 'mapping'"
      v-model="jsonEditorData"
      back-text="Return to settings"
      :display-back-link="true"
      @go-back="goBack"
      @update="createMapping"
    />
  </div>
</template>

<script>
import { getMapping } from '@/lib/mapping';
import { showError } from '@/lib/api/error';

export default {
  name: 'ServiceDetails',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mutableService: this.service,
      jsonEditorData: {},
      editorToDisplay: null,
      optionType: null,
      mappingName: null,
      mappingType: null,
    };
  },
  computed: {
    serviceStatus() {
      return this.mutableService.status === true ? 'Active' : 'Disabled';
    },
    integrationUsername() {
      return this.mutableService.integration.username;
    },
    serviceInformation() {
      const information = [
        { label: 'ID', value: this.mutableService.id },
        {
          label: 'Status',
          value: this.mutableService.status ? 'Active' : 'Disabled',
        },
        { label: 'Description', value: this.mutableService.description },
      ];

      if (this.$patchworks()) {
        information.push(
          {
            label: 'From Environment',
            value: this.mutableService.from_environment,
          },
          { label: 'To Environment', value: this.mutableService.to_environment }
        );
      }

      return information;
    },
    integrationInformation() {
      return [
        { label: 'ID', value: this.mutableService.integration.id },
        { label: 'Name', value: this.mutableService.integration.name },
        { label: 'Username', value: this.mutableService.integration.username },
        { label: 'Server', value: this.mutableService.integration.server },
      ];
    },
    sourceFilterTemplateInformation() {
      if (!this.mutableService.source_filter_template) {
        return;
      }

      return [
        { label: 'ID', value: this.mutableService.source_filter_template.id },
        {
          label: 'Name',
          value: this.mutableService.source_filter_template.name,
        },
        {
          label: 'Re-Sync Column',
          value: this.mutableService.source_filter_template.pw_value_field,
        },
      ];
    },
  },
  methods: {
    parseOptions(optionsJson) {
      return JSON.parse(optionsJson.replace(/\\n|\\t|\\r|\\/gm, ''));
    },
    goBack() {
      this.editorToDisplay = null;
    },
    editFromOptions() {
      this.editOptions(this.mutableService.from_options, 'from_options');
    },
    editToOptions() {
      this.editOptions(this.mutableService.to_options, 'to_options');
    },
    editOptions(options, optionType) {
      try {
        this.jsonEditorData = options;
      } catch (e) {
        this.jsonEditorData = {};
      }

      this.optionType = optionType;
      this.editorToDisplay = 'options';
    },
    updateOptions() {
      const serviceData = {
        [this.optionType]: this.jsonEditorData,
      };

      this.$axios
        .$patch(`/api/api/v2/services/${this.mutableService.id}`, serviceData)
        .then((service) => {
          this.mutableService = service.data;
          this.$notify(
            {
              group: 'notifications',
              type: 'success',
              text: 'Options successfully updated',
            },
            4000
          );
        })
        .catch((error) => showError(this.$notify, error, 5000));
    },
    handleServiceUpdated(serviceData) {
      this.mutableService = Object.assign({}, this.mutableService, serviceData);
      this.$emit('service-updated', this.mutableService);
    },
    editFromMapping() {
      this.editMapping(
        this.mutableService.from_mapping,
        'fromMapping',
        this.mutableService.from_factory
      );
    },
    editToMapping() {
      this.editMapping(
        this.mutableService.to_mapping,
        'toMapping',
        this.mutableService.to_factory
      );
    },
    async editMapping(mappingName, mappingType, factoryName) {
      this.mappingName = mappingName;
      this.mappingType = mappingType;

      if (!this.mappingName) {
        this.mappingName = this.convertFactoryToMappingName(factoryName);
        this.jsonEditorData = {};
        this.editorToDisplay = 'mapping';
        return;
      }

      try {
        this.jsonEditorData = await getMapping(
          this.$axios,
          `${this.integrationUsername}_${this.mappingName.toLowerCase()}`
        ).then((r) => this.parseOptions(r.data.content));
        this.editorToDisplay = 'mapping';
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed loading mapping: ${error}`,
          },
          4000
        );
      }
    },
    createMapping() {
      const id = `${this.integrationUsername}_${this.mappingName}`;
      const mappingData = {
        integration_id: this.service.integration_id,
        search_field: id,
        mapping_name: this.mappingName,
        content: JSON.stringify(this.jsonEditorData),
      };
      this.$axios
        .$post('/api/api/v2/mappings', mappingData)
        .then((mapping) => {
          if (!this.mutableService[this.mappingType]) {
            const serviceData = {
              [this.mappingType]: this.mappingName,
            };
            this.$axios
              .$patch(
                `/api/api/v2/services/${this.mutableService.id}`,
                serviceData
              )
              .then((service) => {
                this.mutableService = service.data;
                this.$notify(
                  {
                    group: 'notifications',
                    type: 'success',
                    text: 'Mapping successfully created',
                  },
                  4000
                );
              })
              .catch((error) => showError(this.$notify, error, 5000));
          } else {
            this.$notify(
              {
                group: 'notifications',
                type: 'success',
                text: 'Mapping successfully updated',
              },
              4000
            );
          }
        })
        .catch((error) => showError(this.$notify, error, 5000));
    },
    convertFactoryToMappingName(factory) {
      return factory.replace(/\\/g, '_').toLowerCase();
    },
  },
};
</script>
