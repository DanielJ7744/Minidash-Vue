<template>
  <div
    class="group flex h-full flex-col justify-between overflow-y-auto border-gray-200 bg-white pt-4 duration-300 ease-in-out md:overflow-x-hidden md:overflow-y-hidden md:border-r"
    :class="[sidebarOpen ? 'md:w-60' : 'md:w-14 hover:md:w-60']"
  >
    <PanelMenu
      v-if="$developer()"
      v-model:expandedKeys="expandedKeys"
      :model="items"
    >
      <template #item="{ item }">
        <NuxtLink
          class="p-panelmenu-header-action min-w-max pl-1"
          :to="item?.to"
          :target="item.external ? '_blank' : null"
          @click="collapseAll()"
        >
          <span
            v-if="item.icon"
            class="p-menuitem-icon"
            :class="item.icon"
          ></span>
          <span
            class="p-menuitem-text transition-opacity duration-200 md:opacity-0 group-hover:md:opacity-100"
            >{{ item.label }}</span
          >
        </NuxtLink>
      </template>
    </PanelMenu>
    <nav
      v-else
      v-for="[type, entries] in Object.entries(links)"
      :key="type"
      class="list-none space-y-2"
      :class="[
        {
          'scrollbar-none overflow-y-auto overflow-x-hidden md:pb-0':
            type === 'admin',
        },
      ]"
    >
      <template
        v-if="
          type === 'client' || $roleAny(['patchworks admin', 'patchworks user'])
        "
      >
        <div
          v-for="(link, idx) in entries"
          :key="idx"
          class="inline"
          :class="[
            {
              'h-16 md:fixed md:bottom-0 md:left-0 md:border-r md:border-t md:border-solid md:border-gray-200 md:bg-white md:pb-4 md:pt-3 md:duration-300 md:ease-in-out':
                type === 'client' && idx === entries.length - 1,
            },
            sidebarOpen && type === 'client' && idx === entries.length - 1
              ? 'md:w-60'
              : 'md:w-14 group-hover:md:w-60',
          ]"
        >
          <li v-if="link.show" class="space-y-2">
            <NuxtLink
              v-bind="link.props"
              class="text-main-800 border-primary group group relative ml-[2px] flex h-8 w-full items-center space-x-2 border-0 px-2 hover:text-gray-700"
            >
              <div class="flex h-9 w-8 shrink-0 items-center justify-center">
                <NavigationSideMenuIcon
                  class="w-[1.125rem]"
                  :icon-name="link.icon"
                />
              </div>
              <div
                class="flex items-center transition-opacity duration-200 md:opacity-0 group-hover:md:opacity-100"
              >
                <p class="truncate text-sm font-medium">
                  {{ link.label }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </div>
      </template>
    </nav>
    <NavigationBiWidget
      v-if="hasBISubscription"
      :sidebar-open="sidebarOpen"
      class="flex-grow"
    />
    <LegacyTransactionsTransactionWidget
      v-if="$roleAny(['patchworks admin', 'client admin'])"
      :sidebar-open="sidebarOpen"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import plans from '~~/enums/Plans';

export default {
  name: 'SideMenu',
  props: {
    sidebarOpen: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useSubscriptionStore, ['primarySubscription', 'plans']),
    hasBISubscription() {
      return (
        !!this.$auth.user.bi_company_id &&
        this.$auth.user.bi_company_id === this.$auth.user.company_id
      );
    },
    links() {
      return {
        client: [
          {
            label: 'Home',
            name: 'index',
            icon: 'icon-home',
            show: true,
            props: { to: { name: 'index' } },
          },
          {
            label: 'Connectors',
            icon: 'icon-link',
            show: true,
            props: { to: { name: 'connections' } },
          },
          {
            label: 'Marketplacee',
            icon: 'icon-link',
            show: true,
            props: { to: { name: 'marketplace' } },
          },
          {
            label: 'Services',
            icon: 'icon-dataflow',
            show: true,
            props: { to: { name: 'services' } },
          },
          {
            label: 'Sync Reports',
            icon: 'icon-bar-chart',
            show: true,
            props: { to: { name: 'client-sync-reports' } },
          },
          {
            label: 'Custom Scripts',
            icon: 'icon-code-block',
            show: this.plans?.some((plan) =>
              [plans.PROFESSIONAL, plans.ENTERPRISE].includes(plan.name)
            ),
            props: { to: { name: 'settings-manage-scripts' } },
          },

          {
            label: 'View Help',
            icon: 'icon-help',
            external: true,
            show: true,
            props: {
              href: 'https://doc.wearepatchworks.com/dashboard/getting-started/who-are-patchworks',
              target: '_blank',
            },
          },
          {
            label: 'Support',
            icon: 'icon-support',
            external: true,
            show: this.primarySubscription.name !== 'Sandbox',
            props: {
              href: 'https://gopatchworks.zendesk.com/hc/en-gb',
              target: '_blank',
            },
          },
          {
            label: 'Settings',
            icon: 'icon-cog',
            show: true,
            props: { to: { name: 'settings' } },
          },
        ],
        admin: [],
      };
    },
    items() {
      return [
        {
          key: '0',
          label: 'Home',
          icon: 'pi pi-home',
          to: { name: 'index' },
        },
        {
          key: '1',
          label: 'Services',
          icon: 'pi pi-arrow-right-arrow-left',
          items: [
            {
              label: 'Service Connectors',
              to: { name: 'connections' },
            },
            {
              label: 'Services',
              to: { name: 'services' },
            },
            {
              label: 'Sync Reports',
              to: { name: 'client-sync-reports' },
            },
            {
              label: 'Custom Scripts',
              to: { name: 'settings-manage-scripts' },
              visible: () =>
                this.plans?.some((plan) =>
                  [plans.PROFESSIONAL, plans.ENTERPRISE].includes(plan.name)
                ),
            },
          ],
        },
        {
          key: '2',
          label: 'Process Flows',
          icon: 'pi pi-sitemap',
          visible: this.$patchworksAdmin(),
          items: [
            {
              key: '2_0',
              label: 'Systems & Connectors',
            },
            {
              key: '2_1',
              label: 'Process Flow List',
            },
            {
              key: '2_2',
              label: 'Run Logs',
            },
            {
              key: '2_2',
              label: 'Canvas (WIP)',
              to: { name: 'flows-1' },
              visible: this.$developer(),
            },
          ],
        },
        {
          key: '3',
          label: 'Stocker',
          icon: 'pi pi-download',
          visible: false,
          items: [
            {
              key: '3_0',
              label: 'Stocker Groups',
            },
          ],
        },
        {
          key: '4',
          label: 'Help',
          icon: 'pi pi-question-circle',
          items: [
            {
              key: '4_0',
              label: 'View Help',
              to: 'https://doc.wearepatchworks.com/dashboard/getting-started/who-are-patchworks',
              external: true,
            },
            {
              key: '4_1',
              label: 'Support',
              to: 'https://gopatchworks.zendesk.com/hc/en-gb',
              external: true,
            },
          ],
        },
        {
          key: '5',
          label: 'Settings',
          to: { name: 'settings' },
          icon: 'pi pi-cog',
          class:
            'md:fixed md:bottom-0 md:left-0 md:bg-white md:pb-4 h-16 md:pt-3 md:ease-in-out md:duration-300 md:border-r md:border-t md:border-gray-200 md:border-solid md:w-14 group-hover:md:w-60 no-active-state',
        },
      ];
    },
  },
  data() {
    return {
      expandedKeys: {},
    };
  },
  methods: {
    collapseAll() {
      this.expandedKeys = {};
    },
  },
};
</script>

<style lang="postcss" scoped>
.nuxt-link-exact-active::before {
  content: '';
  position: absolute;
  top: 6px;
  left: -2px;
  width: 4px;
  height: 18px;
  background-color: #50134c;
}
</style>
