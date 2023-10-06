<template>
  <div class="space-y-10 divide-y page-container">
    <div class="space-y-5">
      <PageHeader>
        <template #title>Choose your destination connector</template>

        <template #actions>
          <div class="hidden">
            <NuxtLink to="/connections/new-service">
              <button
                class="flex items-center px-3 py-2 space-x-3 text-gray-600 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-500 hover:text-gray-700"
              >
                <div class="text-lg icon icon--add" />
                <p>Add new empty service</p>
              </button>
            </NuxtLink>
          </div>
        </template>
      </PageHeader>

      <div>
        <input
          v-model="search"
          type="text"
          placeholder="Can't see an app? Try searching..."
        />
      </div>
    </div>

    <ConnectionsServiceSetupConnectors :search="search" />
  </div>
</template>

<script>
export default {
  name: 'CreateService',
  props: {
    connector: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    search: '',
  }),
};
</script>
