<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form
    v-else
    ref="container"
    class="flex h-full flex-col overflow-hidden"
    @submit.prevent="saveCustomEntity()"
  >
    <div class="flex h-full flex-1 space-x-3 overflow-hidden px-2">
      <div class="h-full flex-1 space-y-3">
        <FormElement
          v-model="form.entity_id"
          title="entity_id"
          label="Entity Type"
          :errors="errors"
          :disabled="makingRequest"
          required
          v-slot="{ inputProps, inputEvents }"
        >
          <select class="w-full" v-bind="inputProps" v-on="inputEvents">
            <option
              v-for="entity in entities"
              :key="entity.id"
              :value="entity.id"
            >
              {{ entity.name }}
            </option>
          </select>
        </FormElement>

        <FormElement
          v-model="form.display_name"
          v-slot="{ inputProps, inputEvents }"
          title="name"
          label="Custom Entity Name"
          :errors="errors"
          required
        >
          <input
            class="w-full"
            type="text"
            maxlength="255"
            placeholder="Entity Name"
            pattern="[a-zA-Z0-9 ]+$"
            title="Name must contain alphanumeric and space characters only."
            :disabled="makingRequest"
            v-bind="inputProps"
            v-on="inputEvents"
          />
        </FormElement>

        <!-- JSON Input -->
        <template v-if="type === 'json'">
          <FormElement title="payload" label="Upload .json file">
            <label class="block">
              <span class="sr-only">Choose File</span>
              <input
                type="file"
                accept="application/json"
                :disabled="makingRequest || enteredPayload"
                class="file:button-primary block w-full border-0 py-2 pl-1 text-sm text-gray-500 file:mr-4 file:rounded-sm file:border-0 file:py-1 file:px-4 file:text-xs file:font-medium"
                @change="fileUploaded($event)"
              />
            </label>
          </FormElement>

          <FormElement
            class="w-full"
            title="payload"
            label="Or enter a JSON object"
          >
            <textarea
              :modelValue="enteredPayload"
              type="text"
              placeholder="Paste a json payload"
              class="w-full"
              rows="20"
              :disabled="makingRequest || uploadedFile"
              @update:modelValue="payloadEntered"
            />
          </FormElement>
        </template>

        <!-- CSV Input -->
        <template v-if="type === 'csv'">
          <FormElement title="file" label="Upload CSV file">
            <label class="block">
              <span class="sr-only">Choose File</span>
              <input
                type="file"
                accept="text/csv"
                class="file:button-primary block w-full border-0 py-2 pl-1 text-sm text-gray-500 file:mr-4 file:rounded-sm file:border-0 file:py-1 file:px-4 file:text-xs file:font-medium"
                :disabled="makingRequest || enteredPayload"
                @change="fileUploaded($event)"
              />
            </label>
          </FormElement>

          <FormElement
            title="payload"
            class="w-full"
            label="OR enter CSV payload"
          >
            <textarea
              :modelValue="enteredPayload"
              type="text"
              placeholder="Enter a CSV with headers"
              class="w-full"
              rows="20"
              :disabled="makingRequest || uploadedFile"
              @update:modelValue="payloadEntered"
            />
          </FormElement>
        </template>
      </div>
      <!-- right -->
      <div class="h-full flex-1 overflow-hidden">
        <template v-if="!detectedFieldsError">
          <div v-if="type === 'json'" class="h-full overflow-hidden">
            <label class="mb-1">Detected Fields</label>
            <div class="mb-3 h-full overflow-y-auto border">
              <EntitiesTreeView :json-data="detectedFields" />
            </div>
          </div>
          <div v-if="type === 'csv'" class="h-full overflow-hidden">
            <label class="mb-1">Detected Fields</label>
            <div class="mb-3 h-full overflow-y-auto border">
              <textarea
                v-model="detectedFieldsToShow"
                type="text"
                placeholder="Your detected fields will show here"
                class="h-full w-full"
                disabled
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="type === 'json'" class="h-full overflow-hidden">
            <label class="mb-1">Detected Fields</label>
            <div class="mb-3 h-full overflow-y-auto border">
              <textarea
                v-model="detectedFieldsError"
                type="text"
                placeholder="Your detected fields will show here"
                class="h-full w-full"
                disabled
              />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="mt-auto h-12 shrink-0 px-2">
      <div class="flex items-end justify-between">
        <div v-if="!showDeleteConfirmButtons">
          <button
            v-if="factorySystemSchema"
            type="button"
            class="button button-danger"
            :disabled="makingRequest"
            @click="showDeleteConfirmation()"
          >
            Delete
          </button>
        </div>
        <div v-else>
          <button
            type="button"
            class="button button-secondary"
            @click="showDeleteConfirmation()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="button button-danger"
            @click="deleteFactorySystem()"
          >
            Confirm
          </button>
        </div>
        <div>
          <button
            type="button"
            class="button button-secondary"
            :disabled="makingRequest"
            @click="closeModal()"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="button button-primary"
            :disabled="makingRequest || detectedFieldsError"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import papa from 'papaparse';
import { mapActions } from 'pinia';

export default {
  name: 'EntityManager',
  props: {
    system: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
    factory: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    factorySystemSchema: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      errors: {},
      form: {
        direction: 'pull',
        entity_id: null,
        display_name: null,
        system_id: this.system.id,
        factory_id: this.factory.id,
        integration_id: this.integration.id,
      },
      entities: null,
      makingRequest: false,
      enteredPayload: null,
      detectedFields: [],
      uploadedFile: null,
      showDeleteConfirmButtons: false,
      detectedFieldsError: null,
    };
  },
  async fetch() {
    this.entities = await this.$axios
      .$get('/api/api/v2/entities')
      .then((r) => r.data);

    if (this.factorySystemSchema) {
      this.form.display_name =
        this.factorySystem.display_name ?? this.factorySystem.entity.name;
      this.form.entity_id = this.factorySystem.entity?.id;

      if (this.type === 'csv') {
        this.detectedFields =
          this.factorySystemSchema.original_schema.split(',');
      }

      if (this.type === 'json') {
        this.detectedFields = JSON.parse(
          this.factorySystemSchema.original_schema
        );
      }
    } else {
      this.form.entity_id = this.entities[0]?.id;
    }
  },
  computed: {
    selectedEntity() {
      return this.form.entity_id
        ? this.entities.find(
            (e) => parseInt(e.id) === parseInt(this.form.entity_id)
          )
        : null;
    },
    factorySystem() {
      return this.factorySystemSchema
        ? this.factorySystemSchema.factory_system
        : null;
    },
    detectedFieldsToShow() {
      return this.detectedFields.length
        ? this.detectedFields.join('\r\n')
        : null;
    },
    schemaStructure() {
      if (!this.selectedEntity) {
        return null;
      }

      const safeEntityName = this.selectedEntity.name
        .toLowerCase()
        .replace(/ /g, '_');

      return JSON.stringify({
        [safeEntityName]: {
          0: this.convertDetectedFieldsToJSONHeaders(),
        },
      });
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
    fileUploaded(event) {
      if (!event.target.files.length) {
        return;
      }

      this.uploadedFile = event.target.files[0];

      if (this.type === 'csv') {
        this.parseCSVToFields(this.uploadedFile);
      }

      if (this.type === 'json') {
        const fileReader = new FileReader();

        fileReader.addEventListener('load', () => {
          this.getJsonSchemaFields(fileReader.result);
        });

        fileReader.readAsText(this.uploadedFile);
      }
    },
    payloadEntered() {
      if (this.type === 'csv') {
        this.parseCSVToFields(this.enteredPayload);
      }

      if (this.type === 'json') {
        this.getJsonSchemaFields(this.enteredPayload);
      }
    },
    parseCSVToFields(dataToParse) {
      papa.parse(dataToParse, {
        header: true,
        complete: (results) => {
          this.detectedFields = results.meta.fields;
        },
      });
    },
    async saveCustomEntity() {
      this.makingRequest = true;

      try {
        if (this.factorySystemSchema) {
          await this.updateFactorySystemSchema();
        } else {
          await this.createCustomEntity();
        }

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully saved the custom entity.',
          },
          4000
        );
        this.$emit('entitySaved');
        this.closeModal();
      } catch (error) {
        this.errors = error.response.data?.errors || {};

        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed saving custom entity. Error: ${error}`,
          },
          4000
        );
      }

      this.makingRequest = false;
    },
    async createCustomEntity() {
      const factorySystem = await this.createFactorySystem();
      await this.createFactorySystemSchema(factorySystem);
    },
    createFactorySystem() {
      return this.$axios
        .$post('/api/api/v2/factory-systems', this.form)
        .then((r) => r.data);
    },
    createFactorySystemSchema(factorySystem) {
      const payload = {
        type: 'json',
        factory_system_id: factorySystem.id,
        integration_id: this.integration.id,
        schema: this.schemaStructure,
        original_type: this.type,
      };

      if (this.type === 'csv') {
        payload.original_schema = this.detectedFields.join(',');
      }

      if (this.type === 'json') {
        payload.original_schema = JSON.stringify(this.detectedFields);
      }

      return this.$axios
        .$post('/api/api/v2/factory-system-schemas', payload)
        .then((r) => r.data);
    },
    updateFactorySystemSchema() {
      const payload = {
        schema: this.schemaStructure,
        original_type: this.type,
      };

      if (this.type === 'csv') {
        payload.original_schema = this.detectedFields.join(',');
      }

      if (this.type === 'json') {
        payload.original_schema = this.enteredPayload;
      }

      return this.$axios
        .$patch(
          `/api/api/v2/factory-system-schemas/${this.factorySystemSchema.id}`,
          payload
        )
        .then((r) => r.data);
    },
    showDeleteConfirmation() {
      this.showDeleteConfirmButtons = !this.showDeleteConfirmButtons;
    },
    async deleteFactorySystem() {
      try {
        this.makingRequest = true;

        // deleting the entity cascades and deletes the factory system
        await this.$axios.$delete(
          `/api/api/v2/factory-systems/${this.factorySystem.id}`
        );

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully deleted the custom entity.',
          },
          4000
        );
        this.$emit('entityDeleted');
        this.closeModal();
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed deleting custom entity. Error: ${error}`,
          },
          4000
        );
      }

      this.makingRequest = false;
    },
    getJsonSchemaFields(json) {
      try {
        const parsedJson = JSON.parse(json);

        if (!Array.isArray(parsedJson)) {
          this.detectedFields = parsedJson;
          this.detectedFieldsError = null;
          return;
        }

        let fields = {};

        parsedJson.forEach((jsonArray) => {
          fields = { ...fields, ...jsonArray };
        });

        this.detectedFields = fields;
        this.detectedFieldsError = null;
      } catch (error) {
        this.detectedFieldsError = 'Invalid JSON payload';
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed parsing JSON. Error: ${error}`,
          },
          4000
        );
      }
    },
    convertDetectedFieldsToJSONHeaders() {
      if (!this.detectedFields) {
        return {};
      }

      if (this.type === 'json') {
        return this.detectedFields;
      }

      return this.detectedFields.reduce(
        (acc, key) => ({ ...acc, [key]: '' }),
        {}
      );
    },
  },
};
</script>
