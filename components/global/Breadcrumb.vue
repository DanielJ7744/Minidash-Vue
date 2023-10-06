<template>
  <nav class="flex lg:mb-2 items-center" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center py-1 space-x-1">
      <li>
        <div>
          <NuxtLink
            :to="{ name: 'index' }"
            class="text-gray-400 hover:text-gray-500"
          >
            <!-- Heroicon name: mini/home -->
            <svg
              class="h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="sr-only">Home</span>
          </NuxtLink>
        </div>
      </li>
      <li v-for="page in crumbsArray" :key="page.name">
        <div class="flex items-center">
          <!-- Heroicon name: mini/chevron-right -->
          <svg
            class="h-5 w-5 flex-shrink-0 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
          <component
            :is="page.url ? 'NuxtLink' : 'p'"
            class="ml-1 text-xs text-gray-400 hover:text-gray-700"
            :to="page.url"
          >
            <span>{{ page.name }}</span>
          </component>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script>
import { NuxtLink } from '#components';

export default {
  name: 'Breadcrumb',
  components: {
    NuxtLink,
  },
  props: {
    crumbs: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    currentPage: {
      type: String,
      required: true,
    },
  },
  computed: {
    crumbsArray() {
      const breadcrumbs =
        Object.entries(this.crumbs).map(([name, url]) => ({
          name,
          url,
        })) || [];

      breadcrumbs.push({ name: this.currentPage });

      return breadcrumbs;
    },
  },
};
</script>
