<template>
  <NuxtLayout>
    <NuxtLoadingIndicator :color="false" class="bg-primary" />
    <NuxtPage />
  </NuxtLayout>
  <Toasts />
</template>

<script setup lang="ts">
const { hook } = useNuxtApp();

// This should live in nuxt.config.ts but seems to be a bug, revisit later
useHead({
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }],
});

hook('page:finish', () => {
  document?.querySelector('main')?.scrollTo(0, 0);
});
</script>
