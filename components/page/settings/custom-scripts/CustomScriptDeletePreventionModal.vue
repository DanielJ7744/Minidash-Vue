<template>
  <div>
    <div class="mb-2">
      This custom script is still in use as a payload script on the below
      services:
    </div>
    <div
      v-for="service in services"
      :key="service.id"
      class="flex justify-between font-medium mb-2 border-b"
    >
      <div>{{ service.id }} - {{ service.description }}</div>
      <div>
        <NuxtLink
          :to="{
            name: 'connections.connectionId.services.serviceId.canvas',
            params: {
              connectionId: service.source_connector.id,
              serviceId: service.id,
            },
          }"
        >
          <span class="icon icon--cog text-lg px-2 md:px-5" />
        </NuxtLink>
      </div>
    </div>
    <div class="mb-2">
      In order to delete this custom script, you will need to stop the above
      services using it.
    </div>
    <div class="mb-2">
      Stopping services from using this script could cause them to no longer
      work as expected. Before removing this script from each service, please
      confirm that it is not used.
    </div>
    <hr />
    <div class="flex justify-center">
      <button
        type="button"
        class="button button-secondary"
        @click="closeModal"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia';

export default {
  name: 'CustomScriptDeletePreventionModal',
  props: {
    services: {
      type: Array,
      required: true,
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal']),
  },
};
</script>
