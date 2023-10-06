<template>
  <div class="flex items-center space-x-3">
    <NuxtLink id="logo" to="/" class="shrink-0">
      <img src="/images/pw.svg" alt="Patchworks" class="h-8" />
    </NuxtLink>

    <UiDropdownMenu
      v-if="$patchworks()"
      v-slot="{ open, buttonProps, buttonEvents }"
      origin-left
      :links="[
        {
          title: 'Switch Companies',
          link: '/admin/company-profiles',
        },
      ]"
    >
      <ButtonDropdown
        class="button button-header"
        v-bind="buttonProps"
        :open="open"
        v-on="buttonEvents"
      >
        <p
          class="m-0 text-sm font-medium leading-5 text-gray-700"
        >
          <span class="truncate">
            {{ companyName }}
          </span>
        </p>
      </ButtonDropdown>
    </UiDropdownMenu>

    <div v-else class="px-0 py-2">
      <p class="text-sm font-medium leading-5 text-gray-700">
        <span class="truncate">
          {{ companyName }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompanySwitcher',
  computed: {
    companyName() {
      return this.$auth.company?.name || 'Patchworks';
    },
  },
};
</script>
