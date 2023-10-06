<template>
  <header class="flex h-14 items-center justify-between border-b bg-white px-3">
    <UiCompanySwitcher />

    <div class="flex items-center space-x-5">
      <!-- <NotificationDropdown v-if="$patchworksAdmin()" /> -->

      <UiDropdownMenu
        v-slot="{ open, buttonProps, buttonEvents }"
        :links="[
          {
            title: $auth.user?.email,
            classes: 'md:hidden truncate',
          },
          {
            title: 'Developer tools',
            action: () => bus.emit(),
            if: loggedInAsDeveloper,
          },
          {
            title: 'Change password',
            link: '/client/change-password',
          },
          {
            title: 'Logout',
            action: () => navigateTo({ name: 'logout' }),
          },
        ]"
      >
        <ButtonDropdown
          class="button button-header"
          v-bind="buttonProps"
          :open="open"
          v-on="buttonEvents"
        >
          <span
            v-if="$auth.user?.avatar_url"
            class="inline-block h-8 w-8 overflow-hidden rounded-full md:mr-1"
          >
            <img
              v-if="$auth.user?.avatar_url"
              class="h-full w-full object-cover"
              :src="$auth.user.avatar_url"
              :alt="$auth.user.name"
            />
            <!-- Heroicon name: outline/user -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-full w-full p-1.5 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </span>
          <span
            v-else
            class="mr-1 inline-block h-6 w-6 overflow-hidden rounded-full bg-gray-100"
          >
            <svg
              class="h-full w-full text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </span>
          <span class="hidden md:inline-block">
            {{ $auth.user?.email }}
          </span>
        </ButtonDropdown>
      </UiDropdownMenu>

      <button
        :aria-expanded="mobileMenuOpen"
        class="button button-dropdown md:hidden"
        type="button"
        @click="() => emit('toggle-mobile-menu')"
      >
        <div class="flex h-8 flex-col justify-center">
          <div class="relative mx-auto sm:max-w-xl">
            <div
              :class="{ 'text-primary': mobileMenuOpen }"
              class="relative h-6 w-6 text-gray-400 focus:outline-none"
            >
              <span class="sr-only">Open main menu</span>
              <div
                class="absolute left-1/2 top-1/2 block w-5 -translate-x-1/2 -translate-y-1/2 transform"
              >
                <span
                  :class="{
                    'rotate-45': mobileMenuOpen,
                    '-translate-y-1.5': !mobileMenuOpen,
                  }"
                  aria-hidden="true"
                  class="absolute block h-0.5 w-5 transform bg-current transition duration-500 ease-in-out"
                />
                <span
                  :class="{ 'opacity-0': mobileMenuOpen }"
                  aria-hidden="true"
                  class="absolute block h-0.5 w-5 transform bg-current transition duration-500 ease-in-out"
                />
                <span
                  :class="{
                    '-rotate-45': mobileMenuOpen,
                    'translate-y-1.5': !mobileMenuOpen,
                  }"
                  aria-hidden="true"
                  class="absolute block h-0.5 w-5 transform bg-current transition duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const { $developer } = useNuxtApp();

const emit = defineEmits(['toggle-mobile-menu']);

defineProps({
  mobileMenuOpen: {
    type: Boolean,
    default: false,
  },
});

const loggedInAsDeveloper = ref($developer());

const bus = useEventBus('developer.tools');
</script>
