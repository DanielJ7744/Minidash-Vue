<template>
  <NuxtLink :to="link" v-slot="{ navigate }" custom>
    <button
      class="button-icon group flex space-x-4 sm:space-x-3 w-full py-3 group text-left"
      @click="navigate"
    >
      <div>
        <div
          class="inline-block border rounded border-gray-300 group-hover:bg-primary transition group-hover:border-primary duration-250"
        >
          <div
            class="p-3 text-xl icon group-hover:text-white duration-250 transition"
            :class="icon"
          />
        </div>
      </div>
      <div
        class="border-b flex-1 min-h-[70px] flex items-center"
      >
        <div>
          <h4
            class="h6 duration-250 transition text-base group-hover:text-primary"
          >
            {{ title }}
          </h4>
          <p
            class="text-sm text-gray-500 group-hover:text-gray-600 duration-250 transition"
          >
            {{ description }}
          </p>
        </div>
      </div>
    </button>
  </NuxtLink>
</template>

<script setup lang="ts">
import { RoutesNamedLocations } from '@typed-router';

defineProps<{
  title: string;
  description: string;
  icon: string;
  link: RoutesNamedLocations;
}>();
</script>
