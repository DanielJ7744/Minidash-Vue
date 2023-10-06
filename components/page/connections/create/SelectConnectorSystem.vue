<template>
  <div>
    <PageHeader>
      <template #title>Let's get started</template>
      <template #description>
        Setup your connectors by selecting the system you wish to connect to
      </template>
    </PageHeader>

    <UiLoading v-if="$fetchState.pending" label="Loading apps..." />

    <div v-else class="space-y-12">
      <input v-model="searchTerm" type="text" placeholder="Search" />
      <div v-if="popularApps.length" class="space-y-4">
        <div>
          <h4 class="h4">Popular Apps</h4>
        </div>
        <div
          class="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 md:grid-cols-4"
        >
          <div v-for="popularApp in popularApps" :key="popularApp.id">
            <IntegrationsPopularAppCard
              :system="popularApp"
              @click="handleSelected"
            />
          </div>
        </div>
      </div>

      <div
        v-for="(systemByType, systemType) in systemsByType"
        :key="systemType"
      >
        <div
          v-if="
            systemByType.length &&
            !systemTypesToHide.includes(systemType.toLowerCase())
          "
        >
          <h5 class="h6">{{ systemType }}</h5>
          <hr />
          <div class="xs:grid-cols-2 grid grid-cols-1 gap-6 md:grid-cols-4">
            <IntegrationsAppCard
              v-for="systemOfType in systemByType"
              :key="systemOfType.id"
              :system="systemOfType"
              :description="systemType"
              :has-matching-credentials="
                hasMatchingCredentials(systemOfType.id)
              "
              @install-system="handleSelected"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

export default {
  name: 'SelectConnectorSystem',
  mixins: [systemsHelperMixin],
  data() {
    return {
      systems: null,
      systemsByType: {},
      popularApps: [],
      systemTypesToHide: [],
      searchTerm: '',
    };
  },
  async fetch() {
    this.systems = await this.$axios
      .$get(
        '/api/api/v2/systems?include=systemAuthorisationTypes.authorisationType'
      )
      .then((r) => r.data);
    this.systemTypes = await this.$axios
      .$get('/api/api/v2/system-types')
      .then((r) => r.data);
    this.getSystemsByType();
    this.getPopularApps();
  },
  watch: {
    searchTerm: useDebounceFn(function () {
      this.searchTriggered();
    }, 750),
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    getPopularApps() {
      this.popularApps = this.systems
        .filter((system) => system.popular && system.status === 'active')
        .map((popularApp) => ({
          ...popularApp,
          systemType: this.systemTypes.find(
            (systemType) =>
              parseInt(systemType.id) === parseInt(popularApp.system_type_id)
          ),
        }))
        .slice(0, 4);
    },
    searchTriggered() {
      this.getSystemsByType();
      this.getPopularApps();
      const newSystemsByType = {};
      for (const key of Object.keys(this.systemsByType)) {
        const newSystemsArray = this.systemsByType[key].filter((system) =>
          system.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        newSystemsByType[key] = newSystemsArray;
      }
      this.systemsByType = newSystemsByType;
      this.popularApps = this.popularApps.filter((popularApp) =>
        popularApp.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    handleSelected(system) {
      this.$emit('selected', system);
    },
    hasMatchingCredentials(systemId) {
      return !!this.systemById(systemId).system_authorisation_types.length;
    },
    getSystemsByType() {
      this.systemTypes.forEach((systemType) => {
        this.systemsByType[systemType.name] = this.systems
          .filter(
            (system) =>
              parseInt(system.system_type_id) === parseInt(systemType.id) &&
              this.isSystemVisible(system)
          )
          .sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          );
      });
    },
    isSystemVisible(system) {
      return (
        (this.hasMatchingCredentials(system.id) &&
          system.status === 'active') ||
        ['inactive', 'development'].includes(system.status)
      );
    },
    systemById(systemId) {
      return this.systems.find(
        (system) => parseInt(system.id) === parseInt(systemId)
      );
    },
  },
};
</script>
