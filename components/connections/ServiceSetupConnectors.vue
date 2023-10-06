<template>
  <UiLoading v-if="$fetchState.pending" />
  <div v-else class="pt-10 space-y-5">
    <div>
      <h5 class="h5">Select a connection</h5>
    </div>
    <div>
      <div
        v-for="[description, entries] in Object.entries(
          groupedConnectors.items
        )"
        :key="description"
      >
        <div class="my-3">
          <h6 class="h6">
            {{ description }}
          </h6>
        </div>
        <div
          class="grid w-full grid-cols-1 gap-4 mb-10 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2"
        >
          <UiCard
            v-for="groupedCredential in entries"
            :key="groupedCredential.id"
          >
            <div class="flex items-center space-x-2">
              <SystemIcon2
                :system="groupedCredential.system"
                class="shrink-0"
              />
              <div class="flex-1 leading-tight">
                <p>
                  <span class="h6">
                    {{ groupedCredential.system.name }}
                  </span>
                  <span class="text-gray-400">
                    ({{ groupedCredential.environment }})
                  </span>
                </p>
                <p
                  v-if="getConnectorName(groupedCredential)"
                  class="text-sm text-gray-600"
                >
                  {{ getConnectorName(groupedCredential) }}
                </p>
                <p v-else class="text-sm text-gray-600">
                  {{ groupedCredential.system.description }}
                </p>
                <p
                  v-if="getStoreName(groupedCredential)"
                  class="text-sm text-gray-600"
                >
                  {{ getStoreName(groupedCredential) }}
                </p>
              </div>
              <NuxtLink
                v-if="!isStartPoint"
                v-slot="{ navigate }"
                custom
                :to="{
                  name: 'connections-connectionId-services-create-destinationConnectionId-configure',
                  params: {
                    connectionId: route.params.connectionId,
                    destinationConnectionId: groupedCredential.id,
                  },
                }"
              >
                <button
                  class="button button-secondary button-sm"
                  @click="navigate"
                >
                  Use
                </button>
              </NuxtLink>
              <NuxtLink
                v-else-if="isStartPoint"
                v-slot="{ navigate }"
                custom
                :to="{
                  name: 'connections-connectionId-services-create',
                  params: { connectionId: groupedCredential.id },
                }"
              >
                <button
                  class="button button-secondary button-sm"
                  @click="navigate"
                >
                  Use
                </button>
              </NuxtLink>
            </div>
          </UiCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import collect from 'collect.js';
import { mapState } from 'pinia';
import Systems from '@/enums/Systems';
import { systemsHelperMixin } from '~/mixins/system-helper-mixin';

export default {
  name: 'ServiceSetupConnectors',
  mixins: [systemsHelperMixin],
  props: {
    search: {
      type: String,
      required: true,
    },
    isStartPoint: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    connectors: [],
    systemTypes: [],
  }),
  async fetch() {
    [this.connectors, this.systemTypes] = await Promise.all([
      this.$axios
        .$get('/api/api/v2/connectors')
        .then((r) => r.data.filter((connector) => !!connector)),
      this.$axios.$get('/api/api/v2/system-types').then((r) => r.data),
    ]);
  },
  computed: {
    ...mapState(useSubscriptionStore, ['biPlan']),
    sourceConnector() {
      return this.connectors.find(
        (connector) => connector.id === this.route.params.connectionId
      );
    },
    groupedConnectors() {
      return collect(this.connectors)
        .filter(
          (connector) =>
            !['globalev2'].includes(connector.system.factory_name.toLowerCase())
        )
        .when(this.search, (connectors) =>
          connectors.filter((connector) =>
            connector.system.name
              .toLowerCase()
              .includes(this.search.toLowerCase())
          )
        )
        .when(!this.isStartPoint, (connectors) =>
          connectors.filter(
            (connector) =>
              ![Systems.INBOUND_API, Systems.SFTP].includes(
                connector.system.name
              )
          )
        )
        .when(!this.isStartPoint, (connectors) =>
          connectors.filter(
            (connector) =>
              connector.integration.id === this.sourceConnector.integration.id
          )
        )
        .when(
          this.isStartPoint || (!this.isStartPoint && !this.biPlan),
          (connectors) =>
            connectors.filter(
              (connector) => connector.system.factory_name !== Systems.BI
            )
        )
        .when(!this.isStartPoint && this.biPlan, (connectors) =>
          connectors.filter(
            (connector, idx, connectors) =>
              connectors.findIndex(
                (connector2) =>
                  connector2.system.factory_name ===
                  connector.system.factory_name
              ) === idx
          )
        )
        .map((connector) => {
          this.systemTypes.forEach((systemType) => {
            if (systemType.id === connector.system.system_type_id) {
              connector.system.description = systemType.name;
            }
          });
          return connector;
        })
        .groupBy((item) => item.system.description);
    },
  },
  methods: {
    getConnectorName(credential) {
      return credential.credentials.connector_name ?? null;
    },
    getStoreName(credential) {
      return credential.credentials.store ?? null;
    },
  },
};
</script>
