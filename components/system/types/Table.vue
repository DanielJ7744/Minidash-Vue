<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <div v-else>
    <div class="mb-2">
      <input
        v-model="searchValue"
        type="text"
        placeholder="Search"
        class="w-full"
      />
    </div>
    <div class="border-b py-2">
      <NuxtLink
        :to="{
          name: 'admin-manage-system-types-create',
        }"
      >
        <button type="button" class="button-empty">
          <span class="icon icon--add content--margin-right-5" />
          Add System Type
        </button>
      </NuxtLink>
    </div>
    <div class="grid grid-cols-3 items-center border-b p-2 font-medium">
      <div>Name</div>
      <div />
    </div>
    <div v-if="filteredSystemTypes.length" class="overflow-auto">
      <div
        v-for="systemType in filteredSystemTypes"
        :key="`systemTypeList${systemType.id}`"
      >
        <div class="flex items-center justify-between border-b py-2 px-2">
          <div class="flex flex-col justify-center">
            <div class="font-medium">
              {{ systemType.name }}
            </div>
          </div>
          <div>
            <NuxtLink
              tag="button"
              class="button button-secondary"
              :to="{
                name: 'admin-manage-system-types-systemTypeId',
                params: { systemTypeId: systemType.id },
              }"
            >
              Manage
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else>No system types found.</div>
  </div>
</template>

<script>
export default {
  name: 'SystemTypesTable',
  data() {
    return {
      systemTypes: [],
      searchValue: '',
    };
  },
  async fetch() {
    await this.getSystemTypes();
  },
  computed: {
    filteredSystemTypes() {
      return this.systemTypes.filter((row) => {
        if ('name' in row && row.name !== null) {
          return row.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase());
        }
        return row.id;
      });
    },
  },
  methods: {
    async getSystemTypes() {
      try {
        this.systemTypes = await this.$axios
          .$get('/api/api/v2/system-types')
          .then((r) => r.data);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed getting system types. Error: ${error}`,
          },
          4000
        );
      }
    },
  },
};
</script>
