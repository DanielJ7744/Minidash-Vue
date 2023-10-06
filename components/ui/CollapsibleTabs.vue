<template>
  <div class="border-b border-gray-200">
    <nav
      ref="scrollableNav"
      class="hidden md:flex px-3 -mb-px space-x-8 relative overflow-auto snap-proximity snap-x"
      aria-label="Tabs"
    >
      <button
        v-for="tab in tabsToDisplay"
        :ref="tab.key"
        :key="tab.key"
        class="px-1 py-4 text-sm whitespace-nowrap snap-center"
        :class="[
          tab.key == modelValue
            ? 'border-b-2 border-primary'
            : 'border-transparent text-opacity-50 hover:text-gray-700 hover:border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        @click.prevent="handleInput(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>
    <div class="w-full md:hidden">
      <select
        id="tabs"
        class="bg-white w-full text-sm text-gray-500"
        name="tabs"
        @change="handleInput($event.target.value, false)"
      >
        <option v-for="tab in tabsToDisplay" :key="tab.key" :value="tab.key">
          {{ tab.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollapsibleTabs',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: false,
      default: null,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Select',
    },
    label: {
      type: String,
      required: false,
      default: 'Select',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    tabsToDisplay() {
      return this.tabs.map(tab => ({
        key: tab.key || tab.label.replace(' ', '').toLowerCase(),
        ...tab,
      }));
    },
  },
  methods: {
    handleInput(key, scroll = true) {
      if (!this.disabled) {
        this.$emit('update:modelValue', key);

        if (scroll) {
          this.$refs[key]?.[0]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      }
    },
  },
};
</script>
