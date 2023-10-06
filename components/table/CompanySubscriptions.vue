<template>
  <DataTable
    class="mt-2"
    :value="subscriptions"
    dataKey="id"
    responsiveLayout="scroll"
    :filters="filters"
  >
    <template #header>
      <div class="flex justify-end">
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <i class="pi pi-search"></i>
          </span>
          <input
            type="text"
            name="subscription-search"
            id="subscription-search"
            autocomplete="subscription-search"
            class="block rounded-md pl-10"
            placeholder="Search..."
            v-model="filters['name'].value"
          />
        </div>
      </div>
    </template>
    <Column field="name" header="Name" :showFilterMenu="true" :sortable="true">
      <template #body="{ data: subscription }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'admin-manage-subscriptions-subscriptionId',
              params: { subscriptionId: subscription.id },
            }"
          >
            {{ subscription.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column
      field="default"
      header="Default"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ polar(subscription.default) }}
      </template>
    </Column>
    <Column
      field="upgrade"
      header="Upgrade"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ polar(subscription.upgrade) }}
      </template>
    </Column>
    <Column
      field="services"
      header="Services"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.services }}
      </template>
    </Column>
    <Column
      field="transactions"
      header="Transactions"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ abbreviateUnit(subscription.transactions) }}
      </template>
    </Column>
    <Column
      field="business_insights"
      header="Business Insights"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ polar(subscription.business_insights) }}
      </template>
    </Column>
    <Column field="sftp" header="SFTP" :showFilterMenu="true" :sortable="true">
      <template #body="{ data: subscription }">
        {{ polar(subscription.sftp) }}
      </template>
    </Column>
    <Column
      field="users"
      header="Users"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.users }}
      </template>
    </Column>
    <Column
      field="api_keys"
      header="Api Keys"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.api_keys }}
      </template>
    </Column>
    <Column
      field="Price"
      header="Price"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.price }}
      </template>
    </Column>
    <Column field="sku" header="SKU" :showFilterMenu="true" :sortable="true">
      <template #body="{ data: subscription }">
        {{ subscription.sku }}
      </template>
    </Column>
    <Column
      field="product_type"
      header="Product Type"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.product_type }}
      </template>
    </Column>
    <Column
      field="bi_refresh_rate"
      header="BI Refresh Rate"
      :showFilterMenu="true"
      :sortable="true"
    >
      <template #body="{ data: subscription }">
        {{ subscription.bi_refresh_rate }}
      </template>
    </Column>
    <template #empty>No subscriptions found.</template>
  </DataTable>
</template>

<script>
import { FilterMatchMode } from 'primevue/api';

export default defineNuxtComponent({
  data() {
    return {
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      },
    };
  },
  async asyncData() {
    return {
      subscriptions: await useFabric('/api/v2/subscriptions').then(
        (r) => r.data
      ),
    };
  },
});
</script>
