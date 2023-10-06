<template>
  <div class="h-screen">
    <div class="flex h-full flex-col overflow-hidden">
      <UiHeader
        class="relative shrink-0"
        @toggle-mobile-menu="() => (mobileMenuOpen = !mobileMenuOpen)"
      />
      <div class="flex h-full overflow-hidden">
        <NavigationSideMenu
          :sidebarOpen="sidebarOpen"
          class="hidden shrink-0 md:flex"
        />

        <div id="side-bar-portal" class="z-0"></div>

        <div class="flex h-full w-full flex-col overflow-hidden">
          <div id="child-navigation-portal"></div>
          <main
            class="relative z-0 h-full flex-1 overflow-y-auto overflow-x-hidden focus:outline-none"
          >
            <div :class="[useRoute().meta?.wide ? 'h-full' : 'page-container']">
              <slot />
            </div>
          </main>
        </div>
      </div>

      <UiSlideOver :open="mobileMenuOpen" @close="mobileMenuOpen = false">
        <div class="px-3 pt-5">
          <NuxtLink :to="{ name: 'index' }">
            <img src="/images/pw-logo.svg" alt="Patchworks" class="h-8" />
          </NuxtLink>
        </div>
        <div class="h-full pb-3 md:pb-0">
          <NavigationSideMenu />
        </div>
      </UiSlideOver>

      <DeveloperTools />
    </div>

    <div id="slide-over-portal"></div>
    <div id="modal-portal"></div>
  </div>
</template>

<script setup>
const {
  public: { intercomAppId },
} = useRuntimeConfig();

const authStore = useAuthStore();
const sidebarOpen = shallowRef(false);
const mobileMenuOpen = shallowRef(false);

onMounted(() => {
  if (!intercomAppId) {
    return;
  }

  try {
    window.Intercom('boot', {
      api_base: 'https://api-iam.intercom.io',
      app_id: intercomAppId,
      name: authStore.user.name,
      email: authStore.user.email,
      created_at: new Date(authStore.user.created_at),
    });
  } catch (error) {
    console.warn('An error occurred during Intercom boot:', error);
  }
});
</script>
