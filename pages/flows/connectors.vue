<template>
  <div>
    <Breadcrumb :current-page="pageTitle" />

    <div class="space-y-12">
      <PageHeader>
        <template #title>{{ pageTitle }}</template>
        <template #description>
          <p>
            Connectors are used to integrate your systems with
            Patchworks. These are the building blocks of
            Patchworks services - any systems/apps that you wish
            to integrate as either the source or destination for a
            data flow, must first be configured in a connector.
          </p>
        </template>
      </PageHeader>
      <div v-for="system in tenantSystems">
        <p class="bold pb-2">{{ system.name }}</p>
        <div class="pl-2">
          <p>Connectors</p>
          <div class="pl-2" v-for="connector in system.connectors">
            <p>{{ connector.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { System } from '~~/types/core/v1';

  const pageTitle = 'Manage your connectors'
  const tenantSystems = ref<System[]>([])
  const { data: systems, error } = await useAsyncData(
    () =>
      useCore<{ data: System[] }>(
        'flow',
        '/api/v1/pipeline-config/tenant/systems?include=connectors'
      ),
    { transform: (r) => r.data }
  );

  if (systems.value?.length) {
    tenantSystems.value = systems.value
  }
</script>
