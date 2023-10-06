<template>
  <main
    aria-labelledby="pageTitle"
    class="flex h-screen items-center justify-center bg-gray-100"
  >
    <div class="max-w-3xl space-y-4 p-4">
      <div
        class="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3"
      >
        <p class="text-primary text-9xl font-medium">
          {{ error.statusCode }}
        </p>
        <div class="space-y-2">
          <h1 id="pageTitle" class="flex items-center space-x-2">
            <svg
              aria-hidden="true"
              class="text-danger-600 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span
              class="text-xl font-medium text-gray-600 sm:text-2xl"
              v-text="details.title"
            >
            </span>
          </h1>
          <p
            class="text-base font-normal text-gray-600"
            v-text="details.message"
          ></p>
          <p class="text-base font-normal text-gray-600">
            You can return to
            <NuxtLink :to="{ name: 'index' }">your dashboard</NuxtLink>
            or <NuxtLink :to="{ name: 'logout' }">logout</NuxtLink>.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import type { NuxtError } from '#app';
const props = defineProps<{
  error: NuxtError;
}>();

try {
  const { $patchworks } = useNuxtApp();

  if ($patchworks() && !process.server) {
    console.error(props.error);
  }
} catch (error) {
  //
}

const details = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return {
        title: "This page doesn't exist.",
        message: "We couldn't find the page you were looking for.",
      };
    default:
      return {
        title: 'An error occurred.',
        message:
          'Something went wrong, please contact support if the issue persists.',
      };
  }
});
</script>
