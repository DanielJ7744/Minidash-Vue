<template>
  <div class="flex flex-1 items-center justify-center">
    <UiCard class="max-w-lg py-4">
      <div class="relative mx-auto h-8 w-12">
        <UiLoading />
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: false, layout: 'guest' });

const authStore = useAuthStore();

onMounted(() => {
  const authToken = useCookie('authToken');
  authToken.value = null;

  authStore.logout();
});
</script>
