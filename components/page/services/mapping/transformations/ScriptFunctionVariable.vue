<template>
  <div>
    <div class="mt-4 flex items-center">
      <div class="flex-none">
        <label> Variable {{ data.id }} </label>
      </div>
      <div class="flex flex-1 justify-end">
        <select v-model="data.type" :disabled="readOnly" class="w-11/12">
          <option value="customerValue">Custom Value</option>
          <option value="mappingField">Source Mapping Field</option>
        </select>
      </div>
      <div class="flex flex-1 justify-end">
        <!-- <select v-if="readOnly" disabled class="w-11/12">
          <option selected>
            {{ data.value }}
          </option>
        </select> -->
        <input
          v-if="data.type === 'customerValue'"
          v-model="data.value"
          type="text"
          class="w-11/12"
        />
        <div v-else class="form-item w-11/12">
          <input
            type="text"
            class="w-full"
            disabled
            :value="data.value"
          />
        </div>
      </div>
      <div v-if="isRemovable" class="flex-none">
        <span
          class="icon icon--cross m-2 cursor-pointer"
          @click="$emit('remove', scriptVariable)"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ScriptFunctionVariable',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    fromSchema: {
      type: Array,
      required: true,
      default: () => {
        return [];
      },
    },
    isRemovable: {
      type: Boolean,
      required: false,
      default: true,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    data: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
};
</script>
