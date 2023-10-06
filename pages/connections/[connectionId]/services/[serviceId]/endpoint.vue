<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <PageHeader>
      <template #title>API Endpoint</template>

      <template #actions>
        <SystemIcon2 :loading="$fetchState.pending" :system="system" />
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" />

    <div v-else>
      <template v-if="inboundEndpoint">
        <UiTitledCard title="Endpoint">
          <template #info>
            <p>This is the API endpoint for the service.</p>
          </template>

          <div>
            <label for="endpoint_url">Inbound Endpoint</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input
                id="endpoint_url"
                type="text"
                name="endpoint_url"
                :value="inboundEndpoint.url"
                class="block w-full rounded-none rounded-l-md border-none bg-gray-100 font-mono focus:outline-none sm:text-sm"
                disabled
              />
              <button
                type="button"
                class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:border-gray-200 active:outline-none active:ring-1 active:ring-gray-200"
                @click="() => copyToClipboard(inboundEndpoint.url)"
              >
                <!-- Heroicon name: solid/clipboard-copy -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path
                    d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"
                  />
                </svg>
                <span>Copy</span>
              </button>
            </div>
          </div>
        </UiTitledCard>
      </template>

      <template v-else>
        <form @submit.prevent="handleCreateEndpoint">
          <UiTitledCard title="Enable Endpoint">
            <FormElement
              v-model="form.slug"
              required
              title="slug"
              label="Vanity URL"
              :errors="errors"
              v-slot="{ inputProps, inputEvents }"
            >
              <input
                v-bind="inputProps"
                class="bg-gray-50 font-mono"
                type="text"
                oninput="this.value = this.value.toLowerCase()"
                v-on="inputEvents"
              />
            </FormElement>
            <div>
              <p class="m-0">Preview:</p>
              <div class="rounded bg-gray-100 px-3 py-2">
                <span class="font-mono text-xs">
                  {{ inboundUrl }}{{ form.slug }}
                </span>
              </div>
            </div>
          </UiTitledCard>

          <div class="flex flex-1 justify-end space-x-2">
            <FormLoadingButton
              class="button-primary"
              type="submit"
              :loading="submitting"
              :disabled="submitting"
            >
              Enable endpoint
            </FormLoadingButton>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Endpoint',
  props: {
    connector: {
      type: Object,
      required: false,
      default: null,
    },
    system: {
      type: Object,
      required: true,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errors: {},
      submitting: false,
      inboundEndpoint: null,
      form: {
        slug: null,
        service_id: this.service.id,
        integration_id: this.service.integration_id,
      },
    };
  },
  async fetch() {
    [this.inboundEndpoint] = await Promise.all([
      this.$axios
        .$get('/api/api/v2/inbound-endpoints', {
          params: { 'filter[service_id]': this.service.id },
        })
        .then((r) => r.data[0]),
    ]);
  },
  computed: {
    inboundUrl() {
      return (
        [process.env.INBOUND_URL, 'v1', this.service.integration.slug].join(
          '/'
        ) + '/'
      );
    },
  },
  methods: {
    async handleCreateEndpoint() {
      this.submitting = true;

      try {
        await this.$axios.post('/api/api/v2/inbound-endpoints', this.form);

        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Endpoint activated',
          },
          4000
        );

        await this.$fetch();
      } catch (error) {
        this.errors = error.response.data?.errors || {};
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: 'Could not activate endpoint',
          },
          4000
        );
      }

      this.submitting = false;
    },
    copyToClipboard(value) {
      navigator.clipboard.writeText(value);

      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Url copied to clipboard',
        },
        2000
      );
    },
  },
};
</script>
