<template>
  <DataTable :value="authorisationTypes" dataKey="id" responsiveLayout="scroll">
    <Column field="id" header="ID" :sortable="true" />
    <Column field="name" header="Name" :sortable="true">
      <template #body="{ data: authorisationType }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'admin-manage-authorisation-types-authorisationTypeId',
              params: { authorisationTypeId: authorisationType.id },
            }"
          >
            {{ authorisationType.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>

    <template #empty>No authorisation types found.</template>
  </DataTable>
</template>

<script>
export default {
  name: 'AuthorisationTypesTable',
  props: {
    authorisationTypes: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
