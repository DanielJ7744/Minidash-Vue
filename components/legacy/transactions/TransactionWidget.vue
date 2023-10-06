<template>
  <div
    class="pt-4 pb-6 mt-6 mb-16 border-t border-solid text-main-800 transaction-widget border-gray-200"
  >
    <div class="space-y-2">
      <div
        class="text-gray-600 hover:text-gray-700 ml-[2px] w-full group px-2 border-0 border-primary flex items-center space-x-2 group h-8"
      >
        <div
          class="flex items-center justify-center w-8 h-8 shrink-0"
        >
          <NavigationSideMenuIcon
            class="w-[1.125rem]"
            icon-name="icon-layer"
          />
        </div>
        <div
          class="flex items-center transition-opacity duration-200 md:opacity-0 group-hover:md:opacity-100"
        >
          <p class="text-sm font-medium truncate">
            {{ primarySubscription.name }}
          </p>
        </div>
      </div>
      <div
        v-if="biPlan"
        class="text-gray-600 hover:text-gray-700 ml-[2px] w-full group px-2 border-0 border-primary flex items-center space-x-2 group h-8"
      >
        <div
          class="flex items-center justify-center w-8 h-8 shrink-0"
        >
          <NavigationSideMenuIcon class="w-[1.125rem]" icon-name="icon-bi" />
        </div>
        <div
          class="flex items-center transition-opacity duration-200 md:opacity-0 group-hover:md:opacity-100"
        >
          <p class="text-sm font-medium truncate">
            {{ biPlan.name }}
          </p>
        </div>
      </div>
      <div
        class="relative w-full px-4 md:w-60"
        :class="[
          sidebarOpen ? 'md:px-4' : 'md:px-0 group-hover:md:px-4',
        ]"
      >
        <div
          class="absolute items-center justify-center hidden h-full gap-3 w-14"
          :class="[
            sidebarOpen
              ? 'md:opacity-0 md:hidden'
              : 'md:opacity-100 group-hover:md:opacity-0 md:flex group-hover:md:hidden',
          ]"
        >
          <ProgressBarVertical
            label="S"
            :total="allowance.services"
            :progress="usage.active_services"
            :bar-width="6"
          />
          <ProgressBarVertical
            label="T"
            :total="allowance.transactions"
            :progress="usage.transaction_count"
            :bar-width="6"
          />
        </div>
        <div class="md:opacity-0 group-hover:md:opacity-100">
          <div
            class="pb-4 mb-4 border-b border-solid border-gray-200"
          >
            <ProgressBar
              label="Active Services"
              :total="allowance.services"
              :progress="usage.active_services"
              :subscription="primarySubscription.name"
            />
          </div>
          <div
            class="pb-4 mb-4 border-b border-solid border-gray-200"
          >
            <div class="flex items-center justify-between">
              <span>Monthly</span>
            </div>
            <ProgressBar
              label="Transactions"
              :total="allowance.transactions"
              :progress="usage.transaction_count"
              :subscription="primarySubscription.name"
            />
          </div>
          <div class="space-y-3 text-center">
            <NuxtLink
              v-slot="{ navigate }"
              :to="{ name: 'settings-billing' }"
              custom
            >
              <button
                class="w-full mb-2 button button-primary button-sm"
                @click="navigate"
              >
                Upgrade Plan
              </button>
            </NuxtLink>
            <NuxtLink
              :to="{ name: 'settings-account-summary' }"
              class="text-gray-800 underline text-sm"
            >
              View account summary
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

export default {
  name: 'TransactionWidget',
  props: {
    sidebarOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(useSubscriptionStore, [
      'allowance',
      'usage',
      'primarySubscription',
      'biPlan',
    ]),
  },
};
</script>
