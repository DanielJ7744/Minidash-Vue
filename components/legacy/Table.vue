<template>
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div
        class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
      >
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg pb-10"
        >
          <table
            aria-describedby="table"
            class="min-w-full divide-y divide-gray-200"
          >
            <thead>
              <tr :class="{ 'hidden md:table-row': hideHeadingMobile }">
                <th
                  v-for="(heading, idx) in parsedHeadings"
                  :key="idx"
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-900 capitalize tracking-wider"
                >
                  {{ heading }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <slot v-if="useSlot" />
              <tr v-for="(row, idx) in rows" v-else :key="idx">
                <td
                  v-for="(value, title) in row"
                  :key="title"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ value }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LegacyTable',
  props: {
    headings: {
      type: Array,
      required: false,
      default: () => [],
    },
    rows: {
      type: Array,
      required: false,
      default: () => [],
    },
    useSlot: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideHeadingMobile: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: () => ({
    parsedHeadings: [],
  }),
  fetch() {
    if (this.useSlot) {
      this.parsedHeadings = this.headings;
    } else {
      this.parsedHeadings = this.generateParsedHeadings();
    }
  },
  mounted() {},
  methods: {
    generateParsedHeadings() {
      return Object.keys(this.rows[0]).map(x => x.split('_').join(' '));
    },
  },
};
</script>
