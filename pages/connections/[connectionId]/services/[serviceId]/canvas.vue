<template>
  <div class="relative h-full">
    <UiLoading v-if="$fetchState.pending" />

    <div v-else class="canvas-custom mx-auto flex h-full max-w-4xl flex-col">
      <ServicesSystemCard :system="system" :service="service" type="source" />

      <div
        class="relative my-3 flex min-h-max flex-1 shrink-0 items-center justify-center overflow-hidden"
      >
        <div v-if="system" class="flex h-full shrink-0 items-center py-3">
          <div
            class="absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2 transform border border-dashed"
            :class="[service.status ? 'border-gray-300' : 'border-danger-500']"
          />
          <div
            class="relative flex h-full min-h-[200px] flex-col justify-between text-center"
          >
            <NuxtLink
              v-if="shouldShowFiltersButton"
              :to="{
                name: 'connections-connectionId-services-serviceId-filters',
                params: {
                  connectionId: route.params.connectionId,
                  serviceId: route.params.serviceId,
                },
              }"
            >
              <div class="canvas-action-button">
                <div class="icon icon--filter" />
                <div>Edit Filters</div>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="integrationIsOnK8s && !serviceHasCustomScript"
              :to="{
                name: 'connections-connectionId-services-serviceId-payload-script',
                params: {
                  connectionId: route.params.connectionId,
                  serviceId: route.params.serviceId,
                },
              }"
            >
              <div class="canvas-action-button">
                <div class="icon icon--code" />
                <div>Add Payload Script</div>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="serviceHasCustomScript && customScript"
              :to="{
                name: 'settings-manage-scripts-scriptId',
                params: { scriptId: service.settings.custom_script_id },
              }"
            >
              <div class="canvas-action-button">
                <div class="icon icon--code" />
                <div>Edit Script</div>
              </div>
            </NuxtLink>

            <NuxtLink
              :to="{
                name: 'connections-connectionId-services-serviceId-mapping',
                params: {
                  connectionId: route.params.connectionId,
                  serviceId: route.params.serviceId,
                },
              }"
            >
              <div class="canvas-action-button">
                <div class="icon icon--pencil" />
                <div>Edit Map</div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <ServicesSystemCard
        :system="destinationSystem"
        :service="service"
        type="destination"
      />

      <div v-if="isNewService" class="flex justify-end pr-2">
        <button
          type="button"
          class="button button-primary"
          @click="goToNextStep"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Systems from '@/enums/Systems';
import { goToNextSetupStep } from '@/lib/serviceSetup';

export default {
  name: 'Canvas',
  props: {
    service: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      default: null,
    },
    connector: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data: () => ({
    destinationSystem: null,
    customScript: null,
  }),
  async fetch() {
    if (this.service.destination_system_id) {
      this.destinationSystem = await this.$axios
        .$get(`/api/api/v2/systems/${this.service.destination_system_id}`)
        .then((r) => r.data);
    }
    if (this.serviceHasCustomScript) {
      this.customScript = await this.$axios
        .$get(
          `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts/${this.service.settings.custom_script_id}`
        )
        .then((r) => r.data);
    }
  },
  computed: {
    shouldShowFiltersButton() {
      return ![Systems.SFTP, Systems.INBOUND_API].includes(
        this.service.source_system.name
      );
    },
    integrationIsOnK8s() {
      return this.service?.integration?.server.endsWith('-k8s');
    },
    serviceHasCustomScript() {
      return !!this.service?.settings?.custom_script_id;
    },
    isNewService() {
      return this.route.query.path === 'new';
    },
  },
  methods: {
    goToNextStep() {
      goToNextSetupStep('trigger', this.connector.id, this.service.id);
    },
  },
};
</script>

<style scoped>
.canvas-action-button {
  @apply hover:border-primary flex items-center justify-center gap-x-1 rounded border bg-gray-50 p-2 text-xs shadow-md;
}
</style>
