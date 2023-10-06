<template>
  <div class="space-y-6">
    <FormElement
      v-model="form.connector_name"
      title="connector_name"
      label="Enter a name for your new connector"
      :errors="errors"
      required
      bold
      v-slot="{ inputProps, inputEvents }"
    >
      <input
        type="text"
        pattern="[a-zA-Z0-9 \-&\+_]+"
        title="Name must contain alphanumeric, ampersand, dash and space characters only."
        v-bind="inputProps"
        v-on="inputEvents"
      />
    </FormElement>
    <FormElement
      v-model="form.integration_id"
      title="integration_id"
      label="Select the group for this connector"
      :errors="errors"
      required
      bold
      v-slot="{ inputProps, inputEvents }"
    >
      <select v-bind="inputProps" v-on="inputEvents">
        <option value="" disabled selected>Please select...</option>
        <option
          v-for="integration in integrations"
          :key="integration.id"
          :value="integration.id"
        >
          <span>{{ integration.name }}</span>
        </option>
      </select>
    </FormElement>
    <FormElement
      v-model="form.environment"
      title="environment"
      label="Is this a live or test connector?"
      :errors="errors"
      required
      bold
      v-slot="{ inputProps, inputEvents }"
    >
      <select v-bind="inputProps" v-on="inputEvents">
        <option value="" disabled selected>Please select...</option>
        <option
          v-for="environment in environments"
          :key="environment.key"
          :value="environment.value"
        >
          {{ environment.key }}
        </option>
      </select>
    </FormElement>

    <FormElement
      v-if="system.environment_suffix_title"
      v-model="form.environment_suffix"
      title="environment"
      :label="'Enter the unique ' + system.environment_suffix_title"
      bold
    >
      <template #default v-slot="{ inputProps, inputEvents }">
        <input type="text" v-bind="inputProps" v-on="inputEvents" />
      </template>
      <template #info>
        <p class="mt-1 text-xs">
          Duplicated transaction IDs in the same environment will be removed
        </p>
      </template>
    </FormElement>
    <div />
  </div>
</template>

<script>
export default {
  name: 'BasicDetails',
  props: {
    initial: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    system: {
      type: Object,
      required: true,
    },
    integrations: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      form: {
        connector_name: null,
        integration_id: null,
        environment: null,
        environment_suffix: null,
        ...this.initial,
      },
      environments: [
        {
          key: 'Live',
          value: 'live',
        },
        {
          key: 'Testing',
          value: 'dev',
        },
      ],
    };
  },
  watch: {
    form: {
      handler(details) {
        this.$emit('update', details);
      },
      deep: true,
    },
  },
};
</script>
