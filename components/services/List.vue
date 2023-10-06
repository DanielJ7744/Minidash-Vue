<template>
  <nav
    class="relative flex-1 min-h-0 -mt-px overflow-y-auto"
    aria-label="Directory"
  >
    <UiLoading v-if="loading" />
    <template v-else>
      <div
        v-if="!services.length"
        class="flex flex-col justify-center h-full text-center"
      >
        <span class="text-2xl icon icon--id-card" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          No services
        </h3>
        <p
          v-if="canAddServicesForSystem"
          class="mt-1 text-sm text-gray-500"
        >
          Get started by creating a
          <NuxtLink
            :to="{
              name: 'connections-connectionId-services-create',
              params: { connectionId: route.params.connectionId },
            }"
          >
            new service.
          </NuxtLink>
        </p>
      </div>
      <template v-else>
        <div
          v-for="entity in entitiesWithServices"
          :key="entity.id"
          class="relative border-gray-200"
        >
          <template v-if="entity.services && entity.services.length">
            <div
              class="sticky top-0 z-10 flex items-center px-4 py-2 space-x-2 text-sm font-medium border-y text-gray-500 border-gray-200 bg-gray-50"
            >
              <span
                class="icon text-gray-700"
                :class="getEntityIconClass(entity.name)"
              />
              <h3 class="mt-px text-xs text-gray-700">
                {{ entity.name }}
              </h3>
            </div>
            <ul
              role="list"
              class="relative z-0 divide-y divide-gray-200"
            >
              <li
                v-for="(service, idx) in entity.services"
                :key="idx"
                :ref="el => (serviceRefs[service.id] = el)"
                class="transition-all duration-1000 bg-white"
                @click="
                  $event.target.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth',
                  })
                "
              >
                <div
                  class="relative flex items-center px-4 py-4 space-x-3 hover:bg-gray-100"
                >
                  <div class="flex-shrink-0">
                    <ServicesStatusIcon :status="service.status" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <!-- Extend touch target to entire panel -->
                    <NuxtLink
                      activeClass="border-l-4 border-primary duration-150"
                      class="absolute inset-0 focus:outline-none"
                      :to="{
                        name: 'connections-connectionId-services-serviceId',
                        params: {
                          connectionId: route.params.connectionId,
                          serviceId: service.id,
                        },
                      }"
                    >
                    </NuxtLink>
                    <p
                      class="font-medium text-sm text-gray-700 truncate"
                    >
                      {{ service.description }}
                    </p>
                    <div
                      class="truncate flex items-center space-x-1"
                    >
                      <span
                        v-if="service.schedule === 'event'"
                        class="text-gray-700 text-md icon icon--play"
                      />
                      <span
                        class="text-xs leading-snug truncate text-gray-500"
                      >
                        {{ $filters.humanCron(service.schedule) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <SystemIcon
                      class="rounded w-7 aspect-square"
                      :system-name="getDestinationFactoryName(service)"
                    />
                  </div>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </template>
    </template>
  </nav>
</template>

<script>
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';
import { systemsHelperMixin } from '@/mixins/system-helper-mixin';

const EventBus = useLegacyEventBus();

export default {
  name: 'ServiceList',
  mixins: [entitiesHelperMixin, systemsHelperMixin],
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    services: {
      type: Array,
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
    entities: {
      type: Array,
      required: true,
    },
    credential: {
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
    serviceRefs: {},
  }),
  computed: {
    entitiesWithServices() {
      return [
        {
          id: undefined,
          services: [],
          name: 'Miscellaneous',
        },
        ...this.entities,
      ]
        .map(entity => ({
          ...entity,
          services: this.services.filter(s =>
            s.destination_entity_id
              ? entity.id === s.destination_entity_id
              : entity.id === s.source_entity_id
          ),
        }))
        .filter(entity => entity.services.length);
    },
    canAddServicesForSystem() {
      return !['globalev2'].includes(this.system?.factory_name.toLowerCase());
    },
  },
  mounted() {
    EventBus.on('service.list:added', added => {
      this.highlightService(added.id);
    });

    EventBus.on('service:updated', serviceId => {
      this.highlightService(serviceId);
    });
  },
  methods: {
    highlightService(id) {
      const highlightClass = 'bg-gray-200';
      const el = this.serviceRefs[id];

      this.$nextTick(() => {
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          el.classList.add(highlightClass);

          useTimeoutFn(() => {
            el.classList.remove(highlightClass);
          }, 3000);
        }
      });
    },
    getDestinationFactoryName(service) {
      return service.destination_system !== null
        ? service.destination_system.name
        : 'patchworks';
    },
  },
};
</script>
