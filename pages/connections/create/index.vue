<template>
  <div>
    <div v-if="route.query.system_id || system">
      <PageConnectionsCreateConnectorForm
        :key="$fetchState.pending.toString()"
        :system="system"
        :integrations="integrations"
        :loading="$fetchState.pending"
      />
    </div>
    <div v-else>
      <PageConnectionsCreateSelectConnectorSystem
        @selected="(selected) => (system = selected)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateConnector',
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      system: null,
      integrations: [],
    };
  },
  async fetch() {
    const systemIdQueryParam = this.route.query.system_id;

    if (systemIdQueryParam) {
      [this.system, this.integrations] = await Promise.all([
        this.fetchSystem(systemIdQueryParam),
        this.fetchIntegrations(),
      ]);
    } else {
      this.integrations = await this.fetchIntegrations();
    }
  },
  methods: {
    fetchIntegrations() {
      return this.$axios.$get('/api/api/v2/integrations').then((r) => r.data);
    },
    fetchSystem(systemId) {
      return this.$axios
        .$get(`/api/api/v2/systems/${systemId}`, {
          params: { include: 'systemAuthorisationTypes.authorisationType' },
        })
        .then((r) => r.data);
    },
  },
};
</script>
