<template>
  <div>

    <Breadcrumb :current-page="pageTitle" />

    <div>

      <div class="bg-[url('/images/marketplace-background.svg')] h-52 mt-5 flex items-center justify-center">
        <div class="text-center px-7">
          <h1 class="text-white text-[32px] md:text-[40px] font-medium leading-snug">
            {{ pageTitle }}
          </h1>
          <p class="leading-normal text-white">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>

      <div class="mt-6 md:-mt-8">
        <div class="max-w-[940px] m-auto px-6">
          <div class="grid md:flex gap-2">
            <span class="flex-grow relative">
              <i class="icon icon--search absolute right-5 top-3 md:top-5" />
              <input
                v-model="searchValue"
                placeholder="Not seeing your system? Try searching here..."
                class="h-[40px] md:h-[60px] w-full px-3 md:px-5 text-sm rounded border border-gray-200"
              />
            </span>
            <button class="button button-secondary rounded px-6 h-[42px] md:h-[60px] font-medium text-gray-800" @click="visiableFilterSidebar = true">
              <img
                :src="'/images/icons/icon-filter.svg'"
                alt="Sort & filter"
                title="Sort & filter"
                class="mr-1.5"
              />
              Sort & filter
            </button>
            <button class="button button-primary rounded px-6 h-[42px] md:h-[60px]">
              <span class="icon icon--plus mr-2" />
              Build a new system
            </button>
          </div>

          <h3 class="mt-8 text-lg font-medium">
            Installed
          </h3>
          <DataView :value="allSystems" class="mt-5">
            <template #list="slotProps">
                <div class="border border-gray-200 rounded-md flex flex-col">
                  <div class="flex">
                    <MarketplaceImageIcon
                      :icon="slotProps.data.img"
                    />
                    <div class="pt-4 px-3 flex-grow">
                      <h4 class="text-[13px] font-medium text-gray-800">{{slotProps.data.name}}</h4>
                      <p class="flex text-xs items-center gap-1 w-full text-gray-500">
                        <span class="flex items-center gap-1.5">
                          <img
                            v-if="slotProps.data.iconClass === 'patchwork'"
                            :src="'/images/icons/icon-patchworks.svg'"
                            alt="By Patchworks"
                            title="By Patchworks"
                          />
                          <img
                            v-else
                            :src="'/images/icons/icon.svg'"
                            alt="By Other"
                            title="By Other"
                          />
                          <span>
                            {{slotProps.data.description}}
                          </span>
                        </span>
                        <Rating v-model="slotProps.data.rating" class="text-[#FFD000]" :cancel="false" readonly />
                      </p>
                    </div>
                  </div>
                  <div class="flex p-4 justify-between border-t border-gray-200 flex-grow">
                    <p class="flex text-xs items-center gap-1.5">
                      <span :class="slotProps.data.categoryIconClass" />
                      <span>
                        {{slotProps.data.category}}
                      </span>
                    </p>
                    <div class="flex items-center">
                      <button v-if="slotProps.data.installStatus === 0" class="button button-secondary">
                        <span class="mr-1 icon icon--cloud-download" />
                        Update available
                      </button>
                      <button v-else-if="slotProps.data.installStatus === 1" class="button button-secondary">
                        <span class="mr-1 icon icon--download3" />
                        Install
                      </button>
                      <div v-else-if="slotProps.data.installStatus === 2" class="text-xs">
                        <span class="mr-1 icon icon--checkmark" />
                        Installed
                      </div>
                    </div>
                  </div>
                </div>
            </template>
          </DataView>
          <h3 class="mt-10 pt-6 border-t text-lg font-medium">
            Marketplace
          </h3>
          <DataView :value="allSystems" class="mt-5" paginator :rows="6">
            <template #list="slotProps">
                <div class="border border-gray-200 rounded-md flex flex-col">
                  <div class="flex">
                    <MarketplaceImageIcon
                      :icon="slotProps.data.img"
                    />
                    <div class="pt-4 px-3 flex-grow">
                      <h4 class="text-[13px] font-medium text-gray-800">{{slotProps.data.name}}</h4>
                      <p class="flex text-xs items-center gap-1 w-full text-gray-500">
                        <span class="flex items-center gap-1.5">
                          <img
                            v-if="slotProps.data.iconClass === 'patchwork'"
                            :src="'/images/icons/icon-patchworks.svg'"
                            alt="By Patchworks"
                            title="By Patchworks"
                          />
                          <img
                            v-else
                            :src="'/images/icons/icon.svg'"
                            alt="By Other"
                            title="By Other"
                          />
                          <span>
                            {{slotProps.data.description}}
                          </span>
                        </span>
                        <Rating v-model="slotProps.data.rating" class="text-[#FFD000]" :cancel="false" readonly />
                      </p>
                    </div>
                  </div>
                  <div class="flex p-4 justify-between border-t border-gray-200 flex-grow">
                    <p class="flex text-xs items-center gap-1.5">
                      <span :class="slotProps.data.categoryIconClass" />
                      <span>
                        {{slotProps.data.category}}
                      </span>
                    </p>
                    <div class="flex items-center">
                      <button v-if="slotProps.data.installStatus === 0" class="button button-secondary">
                        <span class="mr-1 icon icon--cloud-download" />
                        Update available
                      </button>
                      <button v-else-if="slotProps.data.installStatus === 1" class="button button-secondary">
                        <span class="mr-1 icon icon--download3" />
                        Install
                      </button>
                      <div v-else-if="slotProps.data.installStatus === 2" class="text-xs">
                        <span class="mr-1 icon icon--checkmark" />
                        Installed
                      </div>
                    </div>
                  </div>
                </div>
            </template>
          </DataView>

          <Sidebar v-model:visible="visiableFilterSidebar" position="right">
            <template #header>
              <div class="flex">
                <h3 class="text-sm font-medium py-6">Sort & Filter</h3>
              </div>
            </template>
            <div class="py-1">
              <Accordion :multiple="true" :activeIndex="[0, 1, 2, 3]">
                <AccordionTab header="Sort">
                  <div v-for="sortType in sortTypes" :key="sortType" class="text-xs flex gap-2 items-center mt-3">
                    <input :checked="sortType == filters.sort"  type="checkbox" :id="sortType" :name="sortType" :value="sortType" @change="sortUpdated($event)">
                    <label :for="sortType">{{sortType}}</label>
                  </div>
                </AccordionTab>
                <AccordionTab header="Author">
                  <div v-for="authorType in authorTypes" :key="authorType" class="text-xs flex gap-2 items-center mt-3">
                    <input :checked="filters.author.includes(authorType)" type="checkbox" :id="authorType" :name="authorType" :value="authorType" @change="authorUpdated($event)">
                    <label :for="authorType">{{authorType}}</label>
                  </div>
                </AccordionTab>
                <AccordionTab header="System Type">
                  <div v-for="systemType in systemTypes" :key="systemType" class="text-xs flex gap-2 items-center mt-3">
                    <input :checked="filters.systemType.includes(systemType)" type="checkbox" :id="systemType" :name="systemType" :value="systemType" @change="systemTypeUpdated($event)">
                    <label :for="systemType">{{systemType}}</label>
                  </div>
                </AccordionTab>
                <AccordionTab header="Rating">
                  <div v-for="ratingType in ratingTypes" :key="ratingType" class="text-xs flex gap-2 items-center mt-3">
                    <input :checked="filters.rating.includes(ratingType)" type="checkbox" :id="ratingType" :name="ratingType" :value="ratingType" @change="ratingUpdated($event)">
                    <label :for="ratingType">{{ratingType}} Star</label>
                    <Rating :stars="ratingType" class="text-[#FFD000]" :cancel="false" readonly />
                  </div>
                </AccordionTab>
              </Accordion>
              <div class="flex items-center justify-between px-7 py-5">
                <button class="button button-secondary rounded px-6 h-[42px] font-medium text-gray-800" @click="clearFilters()">
                  Clear all filters
                </button>
                <button class="button button-primary rounded px-6 h-[42px]" @click="applyFilters()">
                  Apply
                </button>
              </div>
            </div>
          </Sidebar>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Patchworks Marketplace',
  data() {
    return {
      pageTitle: 'Patchworks Marketplace',
      borderStyleLight: true,
      searchValue: '',
      visiableFilterSidebar: false,
      filters: {
        sort: '',
        author: [],
        systemType: [],
        rating: []
      },
      sortTypes: [
        'Alphabetical (A-Z)',
        'Alphabetical (Z-A)',
        'By Date (Newest first)',
        'By Date (Oldest first)',
        'By Rating (Highest rated first)',
        'By Rating (Lowest rated first)'
      ],
      authorTypes: [
        'Patchworks',
        'Twilio'
      ],
      systemTypes: [
        'eCommerce',
        'WMS/3PL',
        'ERP',
        'POS',
        'Marketing',
        'Marketplaces',
        'Returns',
        'Data',
        'Security'
      ],
      ratingTypes: [1, 2, 3, 4, 5],
      testData: [
        {
          name: 'Amazonn S3 Connector',
          description: 'by Patchworks',
          installStatus: 0,
          category: 'Ecommerce',
          img: 'Shopify',
          iconClass: 'patchwork',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
        {
          name: 'Shopify S3 Connector',
          description: 'by Patchworks',
          installStatus: 1,
          category: 'Ecommerce',
          img: 'Netsuite',
          iconClass: 'other',
          categoryIconClass: 'icon icon--bag',
          rating: 3
        },
        {
          name: 'Amazon S3 Connector',
          description: 'by Patchworks',
          installStatus: 2,
          category: 'Ecommerce',
          img: 'Peoplevox',
          iconClass: 'patchwork',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
        {
          name: 'Amazon S3 Connector',
          description: 'by Patchworks',
          installStatus: 0,
          category: 'Ecommerce',
          img: 'Brightpearl',
          iconClass: 'patchwork',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
        {
          name: 'Amazon S3 Connector',
          description: 'by Patchworks',
          installStatus: 0,
          category: 'Ecommerce',
          img: 'Brightpearl',
          iconClass: 'other',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
        {
          name: 'Amazon S3 Connector',
          description: 'by Patchworks',
          installStatus: 0,
          category: 'Ecommerce',
          img: 'Shopify',
          iconClass: 'patchwork',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
        {
          name: 'Amazon S3 Connector',
          description: 'by Patchworks',
          installStatus: 0,
          category: 'Ecommerce',
          img: 'Shopify',
          iconClass: 'patchwork',
          categoryIconClass: 'icon icon--bag',
          rating: 5
        },
      ]
    };
  },
  computed: {
    allSystems() {
      return this.testData.filter((system) => {
        return system.name
          .toLowerCase()
          .includes(this.searchValue.toLowerCase());
      });
    },
  },
  methods: {
    applyFilters() {
      console.log(this.filters)
    },
    clearFilters() {
      this.filters.sort = ''
      this.filters.author = []
      this.filters.systemType = []
      this.filters.rating = []
    },
    sortUpdated(e) {
      this.filters.sort = e.target.value
    },
    authorUpdated(e) {
      const itemValue = e.target.value
      if (e.currentTarget.checked && !(this.filters.author.includes(itemValue))) {
        this.filters.author.push(itemValue)
      } else {
        this.filters.author.splice(this.filters.author.indexOf(itemValue), 1);
      }
    },
    systemTypeUpdated(e) {
      const itemValue = e.target.value
      if (e.currentTarget.checked && !(this.filters.systemType.includes(itemValue))) {
        this.filters.systemType.push(itemValue)
      } else {
        this.filters.systemType.splice(this.filters.systemType.indexOf(itemValue), 1);
      }
    },
    ratingUpdated(e) {
      const itemValue = parseInt(e.target.value)
      if (e.currentTarget.checked && !(this.filters.rating.includes(itemValue))) {
        this.filters.rating.push(itemValue)
      } else {
        this.filters.rating.splice(this.filters.rating.indexOf(itemValue), 1);
      }
    }
  }
};
</script>

<style>
.p-dataview-content .p-grid {
  @apply grid grid-cols-3 gap-5;
}
@media screen and (max-width: 72em) {
  .p-dataview-content .p-grid {
    @apply grid-cols-2;
  }
}
@media screen and (max-width: 48em) {
  .p-dataview-content .p-grid {
    @apply grid-cols-1;
  }
}
.p-paginator-bottom {
  @apply mt-12;
}
.p-paginator {
  @apply justify-end;
}
.p-sidebar .p-sidebar-header {
  @apply px-5;
}
.p-sidebar .p-sidebar-header .p-sidebar-close {
  @apply h-3 w-3;
}
.p-sidebar-right .p-sidebar {
  @apply w-[400px];
}
.p-accordion-header-action {
  @apply flex-row-reverse justify-between text-sm font-medium pt-5 pb-6;
}
.p-accordion-tab {
  @apply px-5 border-b;
}
.p-accordion-content {
  @apply pb-5;
}
@keyframes p-component-overlay-enter-animation {
  from {
    background-color: transparent;
  }
  to {
    @apply bg-black/40;
  }
}
</style>

<!-- 
<script setup lang="ts">
import { System } from '~~/types/core/v1';
const { core } = useCore();
const pageTitle = ref('Patchworks Marketplace');
const systems = ref<System[]>([]);
const { data, error } = await useAsyncData(
  () => core<{ data: System[] }>('systems').landlord(),
  { transform: (r) => r.data }
);
if (data.value?.length) {
  systems.value = data.value;
}
error ?? console.log(error);
</script>
-->
