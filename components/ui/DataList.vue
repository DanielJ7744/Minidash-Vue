<template>
  <div>
    <ButtonDropdown
      v-if="reveal"
      class="flex items-center outline-none p-0 text-gray-600"
      :class="{ 'mb-4': show }"
      :open="show"
      @click="show = !show"
    >
      <p class="m-0 text-xs">Details</p>
    </ButtonDropdown>

    <div
      v-show="reveal ? show : true"
      wide
      class="py-0 shadow-none bg-transparent"
    >
      <dl class="divide-y divide-gray-200 text-xs">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="px-3 md:px-6 py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4 text-gray-600"
        >
          <dt class="font-medium">
            {{ item.label }}
          </dt>
          <dd class="mt-3 flex sm:mt-0 sm:col-span-2 font-normal overflow-auto">
            <span class="flex-grow" :class="item.class">
              {{ item.value }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataList',
  props: {
    reveal: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
      required: false,
    },
  },
  data: () => ({
    show: false,
  }),
};
</script>
