<template>
  <DataTable :value="filteredGroups" :lazy="true" responsiveLayout="scroll">
    <template #header>
      <div class="justify-end flex">
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
            name="group-search"
            id="group-search"
            autocomplete="group-search"
            class="block w-full rounded-md pl-10"
            placeholder="Search..."
            v-model="searchValue"
          />
        </div>
      </div>
    </template>
    <Column header="Name" field="name" :showFilterMenu="false">
      <template #body="{ data: notificationGroup }">
        <p class="font-medium">
          <NuxtLink
            :to="{
              name: 'settings-notification-groups-groupId',
              params: { groupId: notificationGroup.id },
            }"
          >
            {{ notificationGroup.name }}
          </NuxtLink>
        </p>
      </template>
    </Column>
    <Column header="Created" field="created_at" :showFilterMenu="false">
      <template #body="{ data: notificationGroup }">
        {{ $filters.date(notificationGroup.created_at) }}
      </template>
    </Column>
    <template #empty>No groups found.</template>
  </DataTable>
</template>

<script>
export default defineNuxtComponent({
  name: 'NotificationGroups',
  data() {
    return {
      groups: [],
      searchValue: '',
    };
  },
  async asyncData() {
    return {
      groups: await useFabric('/api/v2/notification-groups', {
        params: {
          include: 'recipients',
        },
      }).then((r) => r.data),
    };
  },
  computed: {
    filteredGroups() {
      return this.groups.filter((group) =>
        group.name.toLowerCase().includes(this.searchValue)
      );
    },
  },
  methods: {
    getInitialsOfName(name) {
      const splitName = name.split(/\s/);
      const initials = [];
      splitName.forEach((word) => {
        initials.push(word.charAt(0));
      });
      if (initials.length > 3) {
        initials.splice(3);
      }

      return initials.join('');
    },
  },
});
</script>
