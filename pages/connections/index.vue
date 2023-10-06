<template>
  <div>
    <Breadcrumb current-page="Connectors" />

    <div class="space-y-12">
      <PageHeader>
        <template #title>Manage your connectors</template>
        a
        <template #description>
          <p>
            Your connectors are used to connect Patchworks to your systems and
            can be used within services.
          </p>
        </template>
        <template #actions v-if="$can('create connectors')">
          <button
            class="button button-primary"
            @click="checkForBaseSubscription({ name: 'connections-create' })"
          >
            <span class="icon icon--plus mr-2" />
            Add connector
          </button>
        </template>
      </PageHeader>
    </div>

    <div v-if="$fetchState.pending" class="flex items-center gap-3">
      <UiLoading class="relative w-auto" />
      <span> Loading Data... </span>
    </div>
    <div v-else-if="$fetchState.error" class="relative h-36">
      <UiError message="An error occurred." />
    </div>
    <template v-else>
      <div class="space-y-5">
        <UiCollapsibleTabs
          v-model="currentTab"
          :tabs="[
            { key: 'live', label: 'Live Connectors' },
            { key: 'test', label: 'Test Connectors' },
          ]"
          :disabled="$fetchState.pending"
          placeholder="Select connector type"
          label="Select connector type"
        />
        <div>
          <div v-if="currentConnectors.length > 9">
            <DataTable
              :value="currentConnectors"
              dataKey="id"
              responsiveLayout="scroll"
              rowGroupMode="subheader"
              groupRowsBy="system.id"
              sortMode="single"
              sortField="system.id"
              :sortOrder="1"
            >
              <Column field="system.id" header="System ID"></Column>
              <Column header="Connector" class="w-4/5">
                <template #body="{ data }">
                  <div class="ml-5 flex items-center space-x-3">
                    <SystemIcon class="w-8" :system-name="data.system.name" />
                    <p class="font-medium">
                      <NuxtLink
                        :to="{
                          name: 'connections-connectionId',
                          params: { connectionId: data.id },
                        }"
                      >
                        {{ data.integration.name }} - {{ data.environment }}
                      </NuxtLink>
                    </p>
                  </div>
                </template>
              </Column>
              <Column>
                <template #body="{ data }">
                  <div class="text-right">
                    <NuxtLink
                      :to="{
                        name: 'connections-connectionId-settings',
                        params: { connectionId: data.id },
                      }"
                      custom
                      v-slot="{ navigate }"
                    >
                      <button
                        v-tooltip.top="'Settings'"
                        class="button-icon"
                        @click="navigate"
                      >
                        <span class="sr-only">Settings</span>
                        <Icon name="la:cog" size="1.5em" />
                      </button>
                    </NuxtLink>
                  </div>
                </template>
              </Column>
              <template #groupheader="{ data }">
                <div class="flex items-center space-x-3">
                  <SystemIcon class="w-10" :system-name="data.system.name" />
                  <p class="font-medium">
                    {{ data.system.name }}
                  </p>
                </div>
              </template>
            </DataTable>
          </div>

          <template v-else>
            <div
              v-if="currentConnectors.length"
              class="xs:grid-cols-2 grid auto-rows-fr grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
            >
              <div v-for="connector in currentConnectors" :key="connector.id">
                <ConnectionsConnectionCard
                  :connector="connector"
                  :system="connector.system"
                  :integration="connector.integration"
                />
              </div>
            </div>
            <UiEmpty v-else>
              No connectors
              <template #info>
                Get started by creating a new connector.</template
              >
              <template #button>
                <NuxtLink
                  :to="{ name: 'connections-create' }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button
                    type="button"
                    class="button button-primary"
                    @click="navigate"
                  >
                    Add a connector
                  </button>
                </NuxtLink>
              </template>
            </UiEmpty>
          </template>
        </div>
      </div>
    </template>

    <Modal id="connectorSubscriptionWarning" :close-on-backdrop-click="false">
      <ConnectionsSubscriptionWarning prevented-from-adding="connector" />
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { subscriptionHelperMixin } from '@/mixins/subscription-helper-mixin';
import Systems from '@/enums/Systems';

export default {
  name: 'Connectors',
  mixins: [subscriptionHelperMixin],
  data() {
    return {
      currentTab: 'live',
      liveTypes: ['live', 'production'],
      testTypes: ['sandbox', 'staging', 'dev', 'development', 'test'],
    };
  },
  async fetch() {
    await Promise.all([
      this.loadSystems(),
      this.loadCredentials(),
      this.loadCompanyIntegrations({ page_number: 1, force_reload: true }),
    ]);

    this.currentTab = 'live';

    if (!this.liveConnectors.length && this.testConnectors.length) {
      this.currentTab = 'test';
    }
  },
  computed: {
    ...mapState(useSubscriptionStore, ['allowance', 'biPlan']),
    ...mapState(useSystemStore, [
      'credentials',
      'systems',
      'companyIntegrations',
    ]),
    connectors() {
      let connectors = this.credentials;

      const inboundAPIConnector = this.credentials.find(
        (c) => c.system?.name === 'Inbound Api'
      );

      if (!inboundAPIConnector && this.allowance.api_keys > 0) {
        connectors = this.pushSubscriptionConnector(
          connectors,
          'live',
          'Inbound API',
          'Inbound Api',
          'API'
        );
      }

      const biConnector = this.credentials.find(
        (connector) => connector.system?.name === 'BI'
      );

      if (this.allowance.business_insights === true && !biConnector) {
        connectors = this.pushSubscriptionConnector(
          connectors,
          'live',
          'BI',
          'BI',
          'BI'
        );
      }

      return connectors;
    },
    liveConnectors() {
      return this.filterBiConnectors(
        this.filterConnectorsByType(this.liveTypes)
      );
    },
    testConnectors() {
      return this.filterBiConnectors(
        this.filterConnectorsByType(this.testTypes)
      );
    },
    currentConnectors() {
      if (this.currentTab === 'test') {
        return this.testConnectors;
      }

      return this.liveConnectors;
    },
  },
  methods: {
    ...mapActions(useSystemStore, [
      'loadSystems',
      'loadCredentials', // TODO: rename credentials to connectors system wide
      'loadCompanyIntegrations',
    ]),
    pushSubscriptionConnector(
      connectors,
      environment,
      connectorName,
      systemName,
      integrationName
    ) {
      connectors.push({
        environment,
        connector_name: connectorName,
        credentials: null,
        system: this.systems.find((system) => system.name === systemName),
        integration: { name: integrationName },
      });

      return connectors;
    },
    filterConnectorsByType(types) {
      return this.connectors
        .filter((connector) => connector.system)
        .filter((connector) =>
          types.some((identifier) => connector.environment.includes(identifier))
        );
    },
    filterBiConnectors(connectors) {
      if (connectors.length) {
        // TODO: what is this doing?
        if (this.$can('create bi-user') && this.biPlan) {
          return connectors.filter(
            (connector, idx, connectors) =>
              connectors.findIndex(
                (connector2) =>
                  connector2.system.factory_name ===
                  connector.system.factory_name
              ) === idx
          );
        } else {
          return connectors.filter(
            (connector) => connector.system.factory_name !== Systems.BI
          );
        }
      }

      return connectors;
    },
  },
};
</script>

<style>
.p-rowgroup-header > td {
  @apply bg-gray-100;
}
</style>
