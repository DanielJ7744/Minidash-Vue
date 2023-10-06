<template>
  <div
    class="pt-4 pb-6 mt-4 mb-16 border-t border-solid text-main-800 transaction-widget border-gray-200"
  >
    <div class="space-y-2">
      <div
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
          <p class="text-sm font-medium truncate">Patchworks BI</p>
        </div>
      </div>
      <div
        class="relative w-full px-4 md:w-60"
        :class="[
          sidebarOpen ? 'md:px-2' : 'md:px-0 group-hover:md:px-2',
        ]"
      >
        <div class="md:opacity-0 group-hover:md:opacity-100">
          <div class="pl-12">
            <a
              :href="biRedemptionUrl"
              target="_blank"
              class="text-gray-800 text-sm"
            >
              BI Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';

export default {
  name: 'BiWidget',
  props: {
    sidebarOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState(useAuthStore, ['company']),
    biRedemptionUrl() {
      return this.company.settings?.bi_redemption_url;
    },
  },
};
</script>
