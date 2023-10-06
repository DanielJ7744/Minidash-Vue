<template>
  <div>
    <Breadcrumb current-page="Manage Factories" :crumbs="{ Settings: '/settings' }" />

    <PageHeader>
      <template #title>{{ pageTitle }}</template>
      <template #actions>
        <NuxtLink
          v-if="$can('create entities')"
          :to="{
            name: 'admin-manage-factories-create',
          }"
          v-slot="{ navigate }"
          custom
        >
          <button
            type="button"
            class="button button-primary"
            @click="navigate"
          >
            <span class="icon icon--plus mr-2" />
            Add factory
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="mt-4">
      <p>
        Service factories are the class names defined within the pull or push
        directories for a Tapestry integration.
      </p>
      <p>
        A factory is used in conjunction with the system to define service
        templates, filters and options.
      </p>
    </div>

    <hr />
    <TableFactories />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
  data() {
    return {
      pageTitle: 'Manage Factories',
    };
  },
};
</script>
