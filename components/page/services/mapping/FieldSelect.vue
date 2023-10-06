<template>
  <div v-if="!enableCustomField && options.length">
    <TreeSelect
      v-model="data"
      :options="filteredTree"
      class="w-full"
      :disabled="disableSelect"
      @show="$emit('fieldOpened')"
    >
      <template #header>
        <div class="relative">
          <span
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <i class="pi pi-search"></i>
          </span>
          <input
            type="text"
            name="subscription-search"
            id="subscription-search"
            autocomplete="subscription-search"
            class="block rounded-md pl-10 mt-2"
            placeholder="Search..."
            v-model="treeFilterTerm"
          />
        </div>
      </template>
    </TreeSelect>
    <div v-if="!hideCustomButton" class="mt-2 w-full flex-auto items-center">
      <button
        class="button button-secondary button-sm"
        @click="useCustomField(true)"
      >
        Enter Custom Field Name
      </button>
    </div>
  </div>
  <div v-else>
    <FormElement
      v-model="customFieldValue"
      title="custom_field"
      :errors="errors"
      v-slot="{ inputProps, inputEvents }"
    >
      <input type="text" v-bind="inputProps" v-on="inputEvents" />
    </FormElement>

    <button
      v-if="options.length"
      class="button button-secondary button-sm mt-2 font-medium"
      @click="useCustomField(false)"
    >
      Cancel Custom Field Name
    </button>
  </div>
</template>

<script>
export default {
  name: 'FieldSelect',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    hideCustomButton: {
      type: Boolean,
      default: false,
    },
    disableSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      enableCustomField: false,
      customFieldValue: null,
      errors: {},
      treeFilterTerm: ''
    };
  },
  computed: {
    filteredTree() {
      const getChildren = (result, object) => {
        if (object.label.toLowerCase().includes(this.treeFilterTerm.toLowerCase())) {
          result.push(object)

          return result
        }
        if (Array.isArray(object.children)) {
          const children = object.children.reduce(getChildren, [])
          if (children.length) result.push({...object, children})
        }

        return result
      }

      return this.options.reduce(getChildren, [])
    },
    data: {
      get() {
        return { [this.modelValue]: true };
      },
      set(value) {
        this.$emit('update:modelValue', Object.keys(value)[0]);
      },
    },
  },
  watch: {
    customFieldValue() {
      this.onCustomInput();
    },
  },
  methods: {
    onCustomInput() {
      if (!this.isCustomInputValid(this.customFieldValue)) {
        this.errors.custom_field = [
          'Please enter a custom field name with a valid path. For example: orders.0.id',
        ];
        return;
      }
      this.$emit('update:modelValue', this.customFieldValue);
    },
    useCustomField(value) {
      this.enableCustomField = value;
    },
    isCustomInputValid(enteredValue) {
      if (this.options[0].children) {
        return enteredValue.includes('.');
      }
      return true;
    },
  },
};
</script>
