<template>
  <FormDropdown
    v-model="selection"
    :items="factorySystems"
    :disabled="disabled"
  >
    <template #default="{ selected }">
      <div v-if="selected" class="flex items-center">
        <div
          class="flex items-center justify-center flex-shrink-0 w-6 h-6 text-green-500 bg-white border border-green-500 rounded aspect-square"
        >
          <span
            class="icon"
            :class="getEntityIconClass(selected.entity.name)"
          />
        </div>
        <span
          v-if="selected.display_name"
          :class="[disabled ? 'text-gray-400' : 'text-gray-600']"
          class="block ml-3 font-normal text-gray-600 truncate group-hover:text-white"
        >
          {{ selected.display_name }}
        </span>
        <span
          v-else
          :class="[disabled ? 'text-gray-400' : 'text-gray-600']"
          class="block ml-3 font-normal text-gray-600 truncate group-hover:text-white"
        >
          {{ selected.service_factory.name }} ({{ selected.entity.name }})
        </span>
      </div>
      <div v-else class="flex items-center">
        <div
          class="flex items-center justify-center flex-shrink-0 w-6 h-6 text-gray-600 bg-white border border-gray-500 rounded aspect-square"
        >
          <span class="icon icon--question-open" />
        </div>
        <span
          :class="[disabled ? 'text-gray-400' : 'text-gray-600']"
          class="block ml-3 font-normal truncate group-hover:text-white"
          >Select an entity...</span
        >
      </div>
    </template>
    <template #item="{ item, selected }">
      <div
        class="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-white border rounded aspect-square"
        :class="[
          selected
            ? 'border-green-500 text-green-500'
            : 'border-gray-700 text-gray-700',
        ]"
      >
        <span class="icon" :class="getEntityIconClass(item.entity.name)" />
      </div>
      <span
        v-if="item.display_name"
        :class="[selected ? 'font-medium' : 'font-normal']"
        class="block ml-3 text-gray-700 truncate group-hover:text-white"
      >
        {{ item.display_name }}
      </span>
      <span
        v-else
        :class="[selected ? 'font-medium' : 'font-normal']"
        class="block ml-3 text-gray-700 truncate group-hover:text-white"
      >
        {{ item.service_factory.name }} ({{ item.entity.name }})
      </span>
    </template>
  </FormDropdown>
</template>

<script>
import { entitiesHelperMixin } from '@/mixins/entities-helper-mixin';

export default {
  name: 'CustomEntitySelector',
  mixins: [entitiesHelperMixin],
  props: {
    modelValue: {
      type: [Number, null],
      required: false,
      default: null,
    },
    factorySystems: {
      type: Array,
      required: false,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    selection: {
      get() {
        return this.factorySystems.find(
          factorySystem => factorySystem.id === this.modelValue
        );
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
};
</script>
