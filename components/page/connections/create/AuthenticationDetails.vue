<template>
  <div class="space-y-6">
    <div class="sm:flex sm:justify-between">
      <fieldset class="w-full">
        <legend class="sr-only">Authentication type</legend>
        <div class="grid grid-cols-1 gap-4 mt-1">
          <div
            v-for="systemAuthorisationType in system.system_authorisation_types"
            :key="systemAuthorisationType.id"
            class="relative flex items-center p-4 border border-gray-300 rounded cursor-pointer focus:outline-none"
            :class="{
              'ring-1 ring-primary':
                form.authorisation_type ===
                systemAuthorisationType.authorisation_type.name,
            }"
            @click.prevent="
              form.authorisation_type =
                systemAuthorisationType.authorisation_type.name
            "
          >
            <input
              v-model="form.authorisation_type"
              type="radio"
              name="authorization-type"
              :key="form.authorisation_type"
              :value="systemAuthorisationType.authorisation_type.name"
              :aria-labelledby="`authentication-type-${systemAuthorisationType.authorisation_type.name}-label`"
              :aria-describedby="`authentication-type-${systemAuthorisationType.authorisation_type.name}-description`"
            />
            <div class="ml-3">
              <p
                :id="`authentication-type-${systemAuthorisationType.authorisation_type.name}-label`"
                class="m-0 text-base text-gray-900"
              >
                {{
                  formatAuthenticationType(
                    systemAuthorisationType.authorisation_type
                  )
                }}
              </p>
              <p
                :id="`authentication-type-${systemAuthorisationType.authorisation_type.name}-description`"
                class="m-0 mt-1 text-xs text-gray-500"
              >
                Authenticate using
                {{
                  formatAuthenticationType(
                    systemAuthorisationType.authorisation_type
                  )
                }}
              </p>
            </div>
            <div
              class="absolute rounded pointer-events-none -inset-px"
              aria-hidden="true"
              :class="{
                'border':
                  form.authorisation_type ===
                  systemAuthorisationType.authorisation_type.name,
                'border-primary':
                  form.authorisation_type ===
                  systemAuthorisationType.authorisation_type.name,
                'border-transparent':
                  form.authorisation_type !==
                  systemAuthorisationType.authorisation_type.name,
              }"
            />
          </div>
        </div>
      </fieldset>

      <FormValidationError :error="errors['authorisation_type']" />
      <div />
    </div>
  </div>
</template>

<script>
import { formatAuthenticationTypeName } from '@/lib/authorisationTypes';

export default {
  name: 'AuthenticationDetails',
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
  },
  data() {
    return {
      form: {
        authorisation_type: '',
        ...this.initial,
      },
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
  methods: {
    formatAuthenticationType(authorisationType) {
      return formatAuthenticationTypeName(authorisationType.name);
    },
  },
};
</script>
