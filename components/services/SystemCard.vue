<template>
  <div class="mx-auto w-full">
    <!-- System -->
    <div v-if="system" class="mx-auto grid gap-5 p-3 lg:grid-cols-1">
      <div class="overflow-hidden rounded shadow-md">
        <div
          ref="container"
          class="flex flex-shrink-0 items-center justify-center bg-gray-300 py-5"
          :class="{ 'border-t border-b border-gray-200': colourWhite }"
        >
          <div
            class="rounded-lg ring-1 ring-white ring-opacity-50"
            :class="{ 'border border-gray-200': colourWhite }"
          >
            <img
              ref="logo"
              class="aspect-square w-28 rounded-lg"
              :src="getIconName(system.name)"
              :alt="system.name"
            />
          </div>
        </div>
        <div
          class="flex justify-between space-y-3 bg-white p-4 md:space-x-3 md:space-y-0"
        >
          <div class="mt-2 flex items-center space-x-3 md:mt-0">
            <div
              class="inline-flex aspect-square w-10 items-center justify-center rounded-md border border-gray-300 bg-white"
            >
              <span class="icon text-lg sm:text-2xl" :class="entityIconClass" />
            </div>
            <div class="flex-1">
              <div>
                <p class="text-sm font-medium tracking-wider text-gray-600">
                  {{ system.name }}
                </p>
              </div>
              <div>
                <p class="text-gray-400 md:text-xs">
                  <span v-if="type === 'source'">
                    {{
                      service.source_entity_id
                        ? splitPascal(service.source_entity.factory_name)
                        : 'No resource assigned'
                    }}
                  </span>
                  <span v-else>
                    {{
                      service.destination_entity_id
                        ? splitPascal(service.destination_entity.factory_name)
                        : 'No resource assigned'
                    }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="items-center md:flex">
            <div>
              <NuxtLink
                v-slot="{ navigate }"
                custom
                :to="{
                  name:
                    type === 'source'
                      ? 'connections-connectionId-services-serviceId-source'
                      : 'connections-connectionId-services-serviceId-destination',
                  params: {
                    connectionId: route.params.connectionId,
                    serviceId: route.params.serviceId,
                  },
                }"
              >
                <button
                  type="button"
                  class="button button-dropdown justify-end md:justify-center"
                  @click="navigate"
                >
                  <span class="icon icon--cog text-lg" />
                </button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else>
      <NuxtLink v-slot="{ navigate }" to="/" custom>
        <button
          type="button"
          class="focus:border-primary relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none"
          @click="navigate"
        >
          <span class="icon icon--add text-2xl" />
          <span class="mt-2 block text-sm font-medium"> Add a {{ type }} </span>
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { FastAverageColor } from 'fast-average-color';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';

export default {
  name: 'SystemCard',
  mixins: [systemsHelperMixin, entitiesHelperMixin],
  props: {
    type: {
      // source/destination
      type: String,
      required: true,
    },
    system: {
      type: Object,
      default: null,
    },
    service: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      route: useRoute(),
    };
  },
  data() {
    return {
      colourWhite: false,
    };
  },
  computed: {
    isServiceScheduled() {
      return (
        this.service.schedule !== 'event' && this.service.schedule !== 'off'
      );
    },
    entityIconClass() {
      return this.getEntityIconClass(
        this.type === 'source'
          ? this.service.source_entity?.database_name
          : this.service.destination_entity?.database_name
      );
    },
  },
  async mounted() {
    const fac = new FastAverageColor();

    try {
      const { hex } = await fac.getColorAsync(this.$refs.logo, {
        algorithm: 'dominant',
      });
      this.$refs.container.style.backgroundColor = hex;
      if (hex === '#ffffff') {
        this.colourWhite = true;
      }
    } catch (error) {
      // Do nothing
    }
  },
};
</script>
