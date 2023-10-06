<template>
  <DataTable
    :value="companies?.data"
    :lazy="true"
    :paginator="true"
    :rows="companies?.meta?.per_page"
    v-model:filters="filters"
    :totalRecords="companies?.meta?.total"
    :loading="loading"
    @page="onPage($event)"
    @sort="onSort($event)"
    @filter="onFilter($event)"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies"
  >
    <template #header>
      <div
        class="items-center justify-between gap-x-3 space-y-3 md:flex md:space-y-0"
      >
        <FormElement
          title="company-search"
          v-model="filters.name.value"
          v-slot="{ inputProps, inputEvents }"
          focus
        >
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5 text-gray-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            <input
              id="company-search"
              type="text"
              autocomplete="company-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-bind="inputProps"
              v-on="inputEvents"
            />
          </div>
        </FormElement>
        <SettingsDatePicker
          v-model="filters.dateRange.value"
          picker-text="Filter by created date"
          :apply-bottom-margin="false"
        />
      </div>
    </template>
    <Column header="Name" field="name" :showFilterMenu="false" :sortable="true">
      <template #body="{ data: company }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'admin-company-profiles-profileId',
              params: { profileId: company.id },
            }"
          >
            {{ company.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column header="Plans">
      <template #body="{ data: company }">
        <p class="inline" v-tooltip.top="getSubscriptions(company)">
          {{ pluralise('subscriptions', company.subscriptions.length) }}
        </p>
      </template>
    </Column>
    <Column
      header="Created"
      field="created_at"
      :showFilterMenu="false"
      :sortable="true"
    >
      <template #body="{ data: company }">
        {{ $filters.date(company.created_at) }}
      </template>
    </Column>
    <Column>
      <template #header>
        <p class="w-full text-right">Switch</p>
      </template>
      <template #body="{ data: company }">
        <div class="space-x-1 text-right text-gray-500">
          <button
            v-tooltip.top="`Switch to ${company.name}`"
            :disabled="!!switchingToCompanyId"
            v-if="
              switchingToCompanyId === company.id ||
              $auth.company.id !== company.id ||
              !!switchingToCompanyId
            "
            @click="switchToCompany(company)"
            class="button-icon"
          >
            <span class="sr-only">{{ `Switch to ${company.name}` }}</span>
            <Icon
              v-if="switchingToCompanyId === company.id"
              name="la:spinner"
              size="1.5em"
              class="animate-spin"
            />
            <Icon v-else name="la:exchange-alt" size="1.5em" />
          </button>
        </div>
      </template>
    </Column>
    <template #empty>No companies found</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'CompanyProfileTable',
  data() {
    return {
      switchingToCompanyId: null,
      loading: false,
      companies: {},
      filters: {
        page: 0,
        name: { value: null },
        dateRange: { value: [dayjs().now, dayjs().now] },
        sortField: 'name',
        sortOrder: 1,
      },
    };
  },
  async asyncData() {
    return {
      companies: await useFabric('/api/v2/patchworks/companies', {
        params: { include: 'subscriptions' },
      }),
    };
  },
  computed: {
    queryParams() {
      const filters = {
        page: this.filters.page + 1,
        include: 'subscriptions',
      };

      if (this.filters.sortField) {
        filters['sort'] =
          this.filters.sortOrder === 1
            ? this.filters.sortField
            : `-${this.filters.sortField}`;
      }

      if (this.filters.name?.value) {
        filters['filter[name]'] = this.filters.name.value;
      }

      if (this.filters.dateRange?.value) {
        filters['filter[created_after]'] = this.filters.dateRange.value[0];
        filters['filter[created_before]'] = this.filters.dateRange.value[1];
      }

      return filters;
    },
  },
  watch: {
    'filters.name.value': useDebounceFn(function () {
      this.getCompanies();
    }, 750),
    'filters.dateRange.value': useDebounceFn(function () {
      this.getCompanies();
    }, 750),
  },
  methods: {
    onSort(e) {
      this.filters.sortField = e.sortField;
      this.filters.sortOrder = e.sortOrder;

      this.getCompanies();
    },
    onPage(e) {
      this.filters.page = e.page;

      this.getCompanies();
    },
    onFilter(e) {
      this.filters.page = 0;

      this.getCompanies();
    },
    async getCompanies() {
      this.loading = true;

      this.companies = await useFabric('/api/v2/patchworks/companies', {
        params: this.queryParams,
      });

      this.loading = false;
    },
    isAllowedToManageCompany(companyId) {
      const { $patchworksAdmin } = useNuxtApp();

      return $patchworksAdmin() || this.$auth.company.id === companyId;
    },
    async switchToCompany(company) {
      const authStore = useAuthStore();

      this.switchingToCompanyId = company.id;

      try {
        await useFabric(
          `/api/v2/patchworks/user/${this.$auth.user.id}/company/${company.id}`,
          { method: 'PUT' }
        );

        await authStore.initialise();

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: `Switched to ${company.name}`,
        });
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed switching company: ${error}`,
          },
          4000
        );
      } finally {
        this.switchingToCompanyId = null;
      }
    },
    getSubscriptions(company) {
      if (!company.subscriptions?.length) {
        return undefined;
      }

      return company.subscriptions
        .map((subscription) =>
          subscription.product_type.includes('bi')
            ? `BI - ${subscription.name}`
            : subscription.name
        )
        .join('\n');
    },
  },
});
</script>
