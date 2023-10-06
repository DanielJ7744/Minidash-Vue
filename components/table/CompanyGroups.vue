<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <template v-else>
    <DataTable :value="filteredIntegrations" responsiveLayout="scroll">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <NuxtLink
              v-if="integrations.length <= 5 || $patchworksAdmin()"
              custom
              v-slot="{ navigate }"
              :to="{
                name: $patchworksAdmin()
                  ? 'admin-company-profiles-profileId-company-groups-create'
                  : 'settings-company-profile-profileId-company-groups-create',
                params: { profileId },
              }"
            >
              <button
                type="button"
                class="button button-primary button-sm"
                @click="navigate"
              >
                Add company group
              </button>
            </NuxtLink>
          </div>

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
              type="text"
              name="company-search"
              id="company-search"
              autocomplete="company-search"
              class="block w-full rounded-md pl-10"
              placeholder="Search..."
              v-model="search"
            />
          </div>
        </div>
      </template>
      <Column field="name" header="Name">
        <template #body="{ data: integration }">
          <div
            class="flex items-center"
            :style="{
              marginLeft:
                (integration.depth > 1 ? integration.depth * 10 : 0) + 'px',
            }"
          >
            <Icon
              v-if="integration.depth"
              name="la:level-up-alt"
              size="1.5em"
              class="mr-2 rotate-90"
            />
            <p class="font-medium">
              <NuxtLink
                :to="{
                  name: $patchworksAdmin()
                    ? 'admin-company-profiles-profileId-company-groups-companyGroupId'
                    : 'settings-company-profile-profileId-company-groups-companyGroupId',
                  params: {
                    companyGroupId: integration.id,
                    profileId: profileId,
                  },
                }"
              >
                {{ integration.name }}
              </NuxtLink>
            </p>
          </div>
        </template>
      </Column>

      <template #empty>No company groups found.</template>
    </DataTable>
  </template>
</template>
<script>
import collect from 'collect.js';

export default {
  name: 'CompanyGroupTable',
  props: {
    profileId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      search: '',
      integrations: [],
    };
  },
  async fetch() {
    this.integrations = this.$patchworksAdmin()
      ? await useFabric(
          `/api/v2/admin/integrations?filter[company_id]=${this.profileId}`
        ).then((r) => r.data)
      : await useFabric('/api/v2/integrations').then((r) => r.data);
  },
  computed: {
    filteredIntegrations() {
      const filtered = collect(this.integrations)
        .sortBy((integration, key) =>
          [
            integration.parent_id || integration.id || 0,
            integration.depth,
          ].join()
        )
        .all();

      return filtered.filter((integration) => {
        if ('name' in integration && integration.name !== null) {
          return integration.name
            .toLowerCase()
            .includes(this.search.toLowerCase());
        }
        return filtered;
      });
    },
  },
};
</script>
