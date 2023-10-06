<template>
  <div>
    <Breadcrumb :current-page="pageTitle" :crumbs="{ Settings: '/settings' }" />

    <PageHeader>
      <template #title>{{ pageTitle }}</template>
      <template #actions>
        <NuxtLink
          v-if="$can('create entities')"
          :to="{
            name: 'admin-manage-entities-create',
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
            Add entity
          </button>
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="mt-4">
      <p>
        Entities are the types of data which can be synced by the system. In
        order for a data type to be displayed in the sync reports, or for
        relevant services to be displayed, the relevant entity must be present
        in this list. Services may exist in the system for other entity types,
        but only those listed here can be managed via the minidash.
      </p>
      <p>
        The entity type is used in conjunction with the system, to enable
        specific entity records to be manually synced (via application of the
        relevant Filter Template).
      </p>
    </div>

    <hr />
    <TableEntities />
  </div>
</template>

<script>
definePageMeta({ middleware: 'patchworks' });

export default {
  name: 'Index',
  data() {
    return {
      pageTitle: 'Manage Entities',
    };
  },
};
</script>
