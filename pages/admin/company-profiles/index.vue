<template>
  <Breadcrumb
    current-page="Company Profiles"
    :crumbs="{ Settings: '/settings' }"
  />

  <PageHeader>
    <template #title>Company Profiles</template>
    <template #description>Create and update company profiles</template>
    <template #actions v-if="$patchworksAdmin()">
      <NuxtLink :to="{ name: 'admin-company-profiles-create' }">
        <button class="button button-primary">
          <span class="text-xs icon icon--plus mr-2"></span>
          Create Company Profile
        </button>
      </NuxtLink>
    </template>
  </PageHeader>

  <TableCompanies />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'patchworks' });
</script>
