<template>
  <div class="relative mt-1" v-on-click-outside="() => (open = false)">
    <button
      type="button"
      :class="[
        disabled
          ? 'cursor-not-allowed'
          : 'focus:ring-1 focus:ring-primary focus:border-primary cursor-default',
      ]"
      class="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
      @click="handleClick"
    >
      <slot :selected="modelValue">
        <span class="flex items-center">
          <span class="block ml-3 truncate">{{
            modelValue.label
          }}</span>
        </span>
      </slot>
      <span
        class="absolute inset-y-0 right-0 flex items-center pr-2 ml-3 pointer-events-none"
      >
        <!-- Heroicon name: solid/selector -->
        <svg
          class="w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <Transition
      appear
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-show="open"
        class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-56 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
        aria-activedescendant="listbox-option-3"
      >
        <li
          v-for="(item, idx) in items"
          id="listbox-option-0"
          :key="item.id"
          class="relative py-2 pl-3 text-gray-900 cursor-default select-none group hover:text-white hover:bg-primary pr-9"
          role="option"
          @click="handleSelect(item)"
        >
          <div class="flex items-center">
            <slot
              name="item"
              :item="item"
              :selected="modelValue && modelValue.id == item.id"
              :index="idx"
            />

            <span
              v-if="modelValue && modelValue.id == item.id"
              class="absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <!-- Heroicon name: solid/check -->
              <svg
                class="w-5 h-5 group-hover:text-white text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'DropDown',
  props: {
    modelValue: {
      type: [Object, null],
      default: null,
    },
    items: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: () => ({
    open: false,
  }),
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.open = !this.open;
      }
    },
    handleSelect(item) {
      this.open = false;

      if (!this.disabled) {
        this.$emit('update:modelValue', item);
      }
    },
  },
};
</script>
