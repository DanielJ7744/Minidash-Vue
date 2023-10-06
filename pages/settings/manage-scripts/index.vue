<template>
  <div>
    <Breadcrumb
      current-page="Custom Scripts"
      :crumbs="{ Settings: '/settings' }"
    />

    <PageHeader>
      <template #title>Custom Scripts</template>
      <template #actions>
        <NuxtLink :to="{ name: 'settings-manage-scripts-create' }">
          <button class="button button-primary button-md">
            <span class="icon icon--plus mr-2 text-xs"></span>
            Create Custom Script
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <TableCustomScripts />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['custom-scripts'],
});
</script>
