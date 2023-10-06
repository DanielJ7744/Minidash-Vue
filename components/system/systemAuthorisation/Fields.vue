<template>
  <UiLoading
    v-if="$fetchState.pending"
    class="w-full"
    label="Loading Data..."
  />
  <div v-else-if="$fetchState.error" class="relative h-36">
    <UiError message="An error occurred." />
  </div>
  <div v-else>
    <div class="mb-2">
      <label>System ID</label>
      <input
        :value="formDetails.system_id"
        type="number"
        class="w-full"
        disabled
      />
    </div>
    <div class="mb-2">
      <label>Authorisation Type</label>
      <select
        v-model="formDetails.authorisation_type_id"
        class="w-full"
        required
        :disabled="makingRequest"
      >
        <option
          v-for="authorisationType in authorisationTypes"
          :key="authorisationType.id"
          :value="authorisationType.id"
        >
          {{ authorisationType.name }}
        </option>
      </select>
    </div>
    <div>
      <label>Credentials Schema</label>
      <div class="grid grid-cols-1 min-h-screen">
        <JsonEditor
          lang="json"
          v-model="formDetails.credentials_schema"
          class="w-full h-full"
          hide-button
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Fields',
  props: {
    initialData: {
      type: Object,
      required: false,
      default: () => ({
        system_id: null,
        authorisation_type_id: null,
        credentials_schema: {},
      }),
    },
    makingRequest: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      authorisationTypes: [],
      formDetails: {
        system_id: this.systemId,
        authorisation_type_id: null,
        credentials_schema: null,
      },
    };
  },
  async fetch() {
    await this.getAuthorisationTypes(1);
    this.formDetails = this.initialData;
  },
  methods: {
    async getAuthorisationTypes(pageNumber) {
      try {
        const response = await this.$axios.$get(
          `/api/api/v2/authorisation-types?page=${pageNumber}`
        );
        this.authorisationTypes = this.authorisationTypes.concat(response.data);
        if (response.meta.last_page > pageNumber) {
          const nextPage = pageNumber++;
          await this.getAuthorisationTypes(nextPage);
        }
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to get authorisation types: ${error}`,
          },
          4000
        );
      }
    },
    formDetailsUpdated() {
      this.$emit('detailsUpdated', this.formDetails);
    },
  },
};
</script>
