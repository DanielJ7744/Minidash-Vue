<template>
  <div class="space-y-10 divide-y page-container">
    <PageHeader>
      <template #title>Choose your source connector</template>
      <template #description
        >Setup your new service by selecting a connector below as your start
        point.</template
      >
    </PageHeader>
    <div class="space-y-5">
      <div>
        <input
          v-model="search"
          type="text"
          placeholder="Not seeing your app? Try searching here..."
        />
      </div>
    </div>

    <ConnectionsServiceSetupConnectors
      :search="search"
      :is-start-point="true"
    />
  </div>
</template>

<script>
export default {
  name: 'NewService',
  data: () => ({
    search: '',
  }),
};
</script>
