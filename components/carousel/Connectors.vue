<template>
  <div v-if="$fetchState.pending" class="flex items-center gap-3">
    <UiLoading class="relative w-auto" />
    <span> Loading Data... </span>
  </div>
  <div v-else-if="!liveSystems.length">No connectors</div>
  <Carousel
    v-else
    :value="liveSystems"
    :numVisible="4"
    :numScroll="3"
    :showIndicators="false"
    :responsiveOptions="responsiveOptions"
  >
    <template #item="{ data: connection }">
      <div class="px-2 py-4">
        <UiCard class="overflow-hidden">
          <div
            class="md:flex-row flex flex-col items-center gap-4"
            @click="
              navigateTo({
                name: 'connections-connectionId',
                params: { connectionId: connection.id },
              })
            "
          >
            <SystemIcon
              class="w-10 rounded"
              :system-name="getSystem(connection.system.id)?.name"
            />
            <div class="md:text-left text-center">
              <h4 class="whitespace-nowrap mb-1 text-sm">
                {{ getSystem(connection.system.id)?.name }}
              </h4>
              <p
                v-if="connection.credentials?.connector_name"
                class="text-xs"
              >
                {{ connection.credentials.connector_name }}
              </p>
              <p v-else class="mb-0 text-xs whitespace-nowrap">
                {{ getCredentialsName(connection) }}
              </p>
            </div>
          </div>
        </UiCard>
      </div>
    </template>
  </Carousel>
</template>

<script>
import { mapActions, mapState } from 'pinia';

export default {
  name: 'ConnectionCarousel',
  async fetch() {
    await Promise.all([
      this.loadSystems(),
      this.loadCredentials(),
      this.loadCompanyIntegrations({ page_number: 1, force_reload: true }),
    ]);
  },
  data() {
    return {
      liveEnvironmentIdentifiers: [
        'live',
        'production',
        'sandbox',
        'staging',
        'dev',
        'development',
        'test',
      ],
      responsiveOptions: [
        {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3,
        },
        {
          breakpoint: '600px',
          numVisible: 2,
          numScroll: 2,
        },
        {
          breakpoint: '480px',
          numVisible: 1,
          numScroll: 1,
        },
      ],
    };
  },
  computed: {
    ...mapState(useSystemStore, [
      'credentials',
      'systems',
      'companyIntegrations',
    ]),
    liveSystems() {
      return this.groupCredentials(this.liveEnvironmentIdentifiers);
    },
  },
  methods: {
    ...mapActions(useSystemStore, [
      'loadSystems',
      'loadCredentials',
      'loadCompanyIntegrations',
    ]),
    groupCredentials(identifiersToUse) {
      let credentials = [];
      const groupedCredentials = {};
      this.credentials.forEach(credential => {
        const systemId = credential.system.id;
        if (!systemId) {
          return;
        }
        if (!(systemId in groupedCredentials)) {
          groupedCredentials[systemId] = [];
        }
        let credentialUsed = false;
        identifiersToUse.forEach(identifier => {
          if (credential.environment.includes(identifier) && !credentialUsed) {
            groupedCredentials[systemId].push(credential);
            credentialUsed = true;
          }
        });
      });
      Object.values(groupedCredentials).forEach(groupedCredential => {
        credentials = credentials.concat(groupedCredential);
      });
      return credentials;
    },
    getSystem(systemId) {
      return this.systems.find(
        system => parseInt(system.id) === parseInt(systemId)
      );
    },
    getCredentialsName(connector) {
      const integration = this.companyIntegrations.find(
        integration =>
          parseInt(integration.id) === parseInt(connector.integration.id)
      );

      return `${integration.name} - ${connector.environment}`;
    },
  },
};
</script>
