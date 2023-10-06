<template>
  <div class="h-16 border-b border-gray-200 bg-white">
    <nav
      class="scrollbar-none -mb-px flex space-x-5 overflow-x-auto px-2 text-gray-600"
      aria-label="Tabs"
    >
      <template v-if="backLink">
        <NuxtLink
          :to="backLink.link"
          class="border-b-2 border-transparent px-1 text-gray-400 hover:text-gray-700"
        >
          <span class="icon icon--arrow-left text-lg" />
        </NuxtLink>
      </template>

      <div
        v-for="(tab, idx) in tabsToDisplay"
        :key="idx"
        v-tooltip.top="getTabTooltip(tab)"
      >
        <component
          :is="tab.action ? 'a' : 'NuxtLink'"
          :to="!!tab.disabled ? undefined : tab.link"
          :class="tab.class"
          exactActiveClass="text-primary border-b-2 border-primary hover:border-b-2"
          class="flex h-16 items-center whitespace-nowrap px-1 text-center text-sm hover:border-b-2"
          @click="handleClick(tab)"
        >
          {{ tab.title }}
        </component>
      </div>
    </nav>
  </div>
</template>

<script>
import { NuxtLink } from '#components';

export default {
  name: 'ChildPageNavigation',
  components: {
    NuxtLink,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    tabsToDisplay() {
      return this.tabs.filter(
        (tab) => !['back'].includes(tab.title.toLowerCase())
      );
    },
    backLink() {
      return this.tabs.find((tab) => tab.title.toLowerCase() === 'back');
    },
  },
  methods: {
    async handleClick(tab) {
      if (tab.action) {
        await tab.action();
      }

      if (tab.link) {
        navigateTo(tab.link);
      }
    },
    getTabTooltip(tab) {
      if (!tab?.disabled) {
        return undefined;
      }
      return tab?.reason;
    },
  },
};
</script>

<style lang="postcss" scoped>
.nuxt-link-exact-active {
  @apply border-primary text-primary font-medium;
}
</style>
