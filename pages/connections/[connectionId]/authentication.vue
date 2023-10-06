<template>
  <div class="page-container-fluid page-container space-y-5 divide-y">
    <PageHeader>
      <template #title>Authentication</template>

      <template #actions>
        <SystemIcon2 :loading="$fetchState.pending" :system="system" />
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" />

    <div v-else-if="system.name !== Systems.INBOUND_API">
      <p>
        This system is not yet supported for generating authentication tokens.
      </p>
    </div>

    <div v-else>
      <UiTitledCard title="Endpoints">
        <template #info>
          <p>
            The token URL generates authentication tokens to enable secure
            access to your service inbound URLs.
          </p>
        </template>

        <div>
          <label for="endpoint_url">Token Endpoint</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              id="endpoint_url"
              type="text"
              name="endpoint_url"
              :value="oauthUrl"
              class="rounded-none rounded-l-md border border-gray-50 font-mono"
            />
            <button
              type="button"
              class="relative -ml-px inline-flex items-center space-x-2 rounded-r-sm border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:border-gray-200 active:outline-none active:ring-1 active:ring-gray-200"
              @click="() => copyToClipboard(oauthUrl)"
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

      <PageConnectionsManageOAuthClients
        :connector="connector"
        :clients="clients"
        @created="clients.push($event)"
        @deleted="clients = clients.filter((client) => client.id !== $event)"
      />
    </div>
  </div>
</template>

<script>
import Systems from '@/enums/Systems';

export default {
  name: 'Authentication',
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
  },
  data() {
    return {
      clients: [],
      Systems,
    };
  },
  async fetch() {
    [this.clients] = await Promise.all([
      this.$axios
        .$get(`/api/api/v2/connectors/${this.connector.id}/oauth-clients`)
        .then((r) => r.data),
    ]);
  },
  computed: {
    oauthUrl() {
      return [useRuntimeConfig().public.inboundUrl, 'oauth', 'token'].join('/');
    },
  },
  methods: {
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
