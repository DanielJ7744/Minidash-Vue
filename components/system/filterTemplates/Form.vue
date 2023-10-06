<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />

  <UiError
    v-else-if="$fetchState.error"
    message="An error occurred."
    class="relative h-36"
  />
  <form v-else @submit.prevent="saveFilterTemplate()" class="space-y-2">
    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Please confirm that you want to remove this filter template."
        @deleteCancel="closeModal"
        @deleteConfirm="runDeleteFilterTemplate"
      />
    </Modal>

    <FormElement
      v-model="factorySystemId"
      required
      :disabled="isMakingRequest"
      title="factory_system_id"
      label="Factory System"
      v-slot="{ inputProps, inputEvents }"
      v-tooltip.top="
        'Pick the system with the closest factory and system for your filter.'
      "
    >
      <select class="w-full" v-bind="inputProps" v-on="inputEvents">
        <option value="please select" disabled>Please select</option>
        <option
          v-for="factorySystem in factorySystems"
          :key="factorySystem.id"
          :value="factorySystem.id"
        >
          System: {{ factorySystem.system.name }}. Factory:
          {{ factorySystem.service_factory.name }}. Direction:
          {{ factorySystem.direction }}
        </option>
      </select>
    </FormElement>

    <FormElement
      v-model="filterTemplateName"
      required
      :disabled="isMakingRequest"
      title="name"
      label="Name"
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        class="w-full"
        placeholder="Example: Peoplevox Stock"
        pattern="[a-zA-Z0-9 \-&[\]\+_]+"
        title="Name must contain alphanumeric, ampersand, dash and space characters only."
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>

    <FormElement
      v-model="filterTemplateFilterKey"
      required
      :disabled="isMakingRequest"
      title="filter_key"
      label="Filter Key"
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        class="w-full"
        placeholder="Example: Item+Code"
        pattern="[a-zA-Z \-\_]+$"
        title="Filter key must contain alphanumeric, ampersand, dash, underscore, plus and space characters only."
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>

    <FormElement title="template" label="Template" required>
      <JsonEditor v-model="filterTemplateTemplate" hide-button />
    </FormElement>

    <FormElement
      v-model="filterTemplateNote"
      required
      :disabled="isMakingRequest"
      title="note"
      label="Note"
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        class="w-full"
        placeholder="Example: Use this to explain the filter"
        pattern="[a-z0-9 \-\&\+\_]+$"
        title="Note value must contain alphanumeric, ampersand, dash, underscore, plus and space characters only."
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>

    <FormElement
      v-model="filterTemplatePWValue"
      required
      :disabled="isMakingRequest"
      title="pw_value"
      label="PW Value"
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        class="w-full"
        placeholder="Example: Item+Code"
        pattern="[a-z0-9 \-\&\+\_]+$"
        title="PW value must contain alphanumeric, ampersand, dash, underscore, plus and space characters only."
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>

    <hr />

    <div
      class="flex flex-col-reverse justify-between gap-2 md:flex-row"
    >
      <div class="flex justify-between gap-2">
        <button
          v-if="filterTemplate"
          type="button"
          class="w-full button button-danger"
          :disabled="isMakingRequest"
          @click="openModal('deleteConfirmation')"
        >
          Delete Filter Template
        </button>
      </div>
      <div
        class="flex flex-col-reverse justify-between gap-2 md:flex-row"
      >
        <button
          type="button"
          class="w-full button button-secondary"
          :disabled="isMakingRequest"
          @click="
            navigateTo({
              name: 'admin-manage-systems-systemId',
              params: { systemId },
            })
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          class="w-full button button-primary lg:whitespace-nowrap"
          :disabled="isMakingRequest"
        >
          Save Filter Template
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'FilterTemplateForm',
  props: {
    systemId: {
      type: Number,
      required: true,
    },
    filterTemplateId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      filterTemplate: null,
      factorySystems: [],
      factorySystemId: 'please select',
      filterTemplateName: null,
      filterTemplateFilterKey: null,
      filterTemplateTemplate: null,
      filterTemplateNote: null,
      filterTemplatePWValue: null,
    };
  },
  async fetch() {
    if (this.filterTemplateId) {
      this.filterTemplate = await this.$axios
        .$get(
          `/api/api/v2/filter-templates/${this.filterTemplateId}?include=factorySystem`
        )
        .then((r) => r.data);
      this.factorySystemId = this.filterTemplate.factory_system.id;
      this.filterTemplateName = this.filterTemplate.name;
      this.filterTemplateFilterKey = this.filterTemplate.filter_key;
      this.filterTemplateTemplate = this.filterTemplate.template
        ? JSON.parse(this.filterTemplate.template)
        : {};
      this.filterTemplateNote = this.filterTemplate.note;
      this.filterTemplatePWValue = this.filterTemplate.pw_value_field;
    }
    await this.getFactorySystems(1);
  },
  computed: {
    filterTemplatePayload() {
      return {
        name: this.filterTemplateName,
        filter_key: this.filterTemplateFilterKey,
        factory_system_id: this.factorySystemId,
        template: JSON.stringify(this.filterTemplateTemplate),
        note: this.filterTemplateNote,
        pw_value_field: this.filterTemplatePWValue,
      };
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    async getFactorySystems(pageNumber) {
      try {
        const response = await this.$axios.$get(
          `/api/api/v2/factory-systems?page=${pageNumber}&filter[system_id]=${this.systemId}&include=system,entity,serviceFactory`
        );
        this.factorySystems = this.factorySystems.concat(response.data);
        if (response.meta.last_page > pageNumber) {
          const nextPage = pageNumber++;
          await this.getFactorySystems(nextPage);
        }
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed getting factory systems. Error: ${error}`,
          },
          4000
        );
      }
    },
    async saveFilterTemplate() {
      try {
        this.isMakingRequest = true;
        if (!this.filterTemplate) {
          await this.$axios.$post(
            '/api/api/v2/admin/filter-templates',
            this.filterTemplatePayload
          );
        } else {
          await this.$axios.$patch(
            `/api/api/v2/admin/filter-templates/${this.filterTemplate.id}`,
            this.filterTemplatePayload
          );
        }
        this.runSuccessActions();
      } catch (error) {
        this.displayError(error);
      }
    },
    async runDeleteFilterTemplate() {
      try {
        this.isMakingRequest = true;
        await this.$axios.$delete(
          `/api/api/v2/admin/filter-templates/${this.filterTemplate.id}`
        );
        this.closeModal();
        this.runSuccessActions();
      } catch (error) {
        this.closeModal();
        this.displayError(error);
      }
    },
    runSuccessActions(isDelete = false) {
      this.$emit('submit-success');
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: isDelete
            ? 'Successfully deleted filter template'
            : 'Successfully saved filter template',
        },
        4000
      );
      this.isMakingRequest = false;
      navigateTo({
        name: 'admin-manage-systems-systemId',
        params: { systemId: this.systemId },
      });
    },
    displayError(error, isDelete = false) {
      this.isMakingRequest = false;
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: isDelete
            ? `Failed deleting the filter template. Error: ${error}`
            : `Failed saving the filter template. Error: ${error}`,
        },
        4000
      );
    },
  },
};
</script>
