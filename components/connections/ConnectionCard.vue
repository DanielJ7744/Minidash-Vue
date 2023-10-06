<template>
  <div
    class="relative h-full overflow-hidden rounded border border-gray-100 shadow-md"
  >
    <button class="w-full" @click="navigateToConnector">
      <div
        ref="container"
        class="relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden py-4"
      >
        <UiLoading v-if="!loaded" />
        <div
          v-show="loaded"
          class="flex aspect-square h-full items-center justify-center rounded border border-solid object-contain p-3"
          :class="[borderStyleLight ? 'border-white' : 'border-gray-500']"
        >
          <GetColor
            image-ref="logo"
            :image-src="system.name"
            :image-alt="system.name"
            @colorValue="setBackgroundColour"
            @imageLoaded="imageLoaded"
          />
        </div>
      </div>
      <div>
        <div
          class="group h-28 w-full justify-between border-t px-4 py-3 text-left hover:bg-gray-50 focus:outline-none"
        >
          <div class="flex h-full flex-col justify-between">
            <h6 class="h6 truncate text-sm">
              {{ system.name }} ({{ connector.environment }} -
              {{ connector.integration.name }})
            </h6>
            <div>
              <div>
                <p
                  class="truncate text-sm text-gray-500"
                  v-if="connectorCredentials && connectorCredentials.store"
                >
                  {{ connectorCredentials.store }}
                </p>
              </div>
              <div>
                <div>
                  <p class="truncate text-sm text-gray-400">
                    <span
                      v-if="
                        connectorCredentials &&
                        connectorCredentials.connector_name
                      "
                    >
                      {{ connectorCredentials.connector_name }}
                    </span>
                    <span v-else> {{ connectorName }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
    <NuxtLink
      v-if="$can('update connectors') && connector.id && loaded"
      :to="{
        name: 'connections-connectionId-settings',
        params: { connectionId: connector.id },
      }"
      custom
      v-slot="{ navigate }"
    >
      <button
        type="button"
        class="absolute top-0 right-0 m-2 flex items-center justify-center rounded bg-white p-1 text-gray-600 hover:bg-opacity-80 hover:text-gray-800"
        @click="navigate"
      >
        <span class="icon clickable-icon icon--cog text-xl text-opacity-90" />
      </button>
    </NuxtLink>
  </div>
</template>

<script>
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import Systems from '@/enums/Systems';

export default {
  name: 'ConnectionCard',
  mixins: [systemsHelperMixin],
  props: {
    connector: {
      type: Object,
      required: true,
    },
    system: {
      type: Object,
      required: true,
    },
    integration: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    loaded: false,
    borderStyleLight: true,
  }),
  computed: {
    connectorName() {
      return `${this.integration.name} - ${this.connector.environment}`;
    },
    connectorCredentials() {
      return this.connector.credentials;
    },
  },
  methods: {
    imageLoaded() {
      this.loaded = true;
    },
    setBackgroundColour(color) {
      if (color === '#ffffff') {
        this.borderStyleLight = false;
      }
      this.$refs.container.style.backgroundColor = color;
    },
    navigateToConnector() {
      if (this.connector.system.name === 'Inbound Api' && !this.connector.id) {
        return navigateTo({
          name: 'connections-inbound-apis-create',
        });
      }
      if (this.connector.system.name === Systems.BI) {
        return navigateTo({
          name: 'connections-connectionId-settings',
          params: { connectionId: this.connector.id },
        });
      }

      navigateTo({
        name: 'connections-connectionId',
        params: { connectionId: this.connector.id },
      });
    },
  },
};
</script>
