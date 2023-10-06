<template>
  <div class="py-5 space-y-3 lg:flex lg:space-y-0 lg:space-x-3">
    <div class="lg:w-1/3">
      <p>Service status</p>
    </div>
    <UiCard class="flex-1 px-6 py-0" wide>
      <div class="flex items-center py-4 space-x-3">
        <ServicesStatusIcon :status="modelValue" />
        <div class="flex-1">
          <h6 >Service status</h6>
          <p class="text-xs">{{ modelValue ? 'Active' : 'Inactive' }}</p>
        </div>
        <div>
          <FormToggle
            :modelValue="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
          />
        </div>
      </div>
      <div v-if="errors['status']" class="py-3">
        <p class="text-xs text-danger-600">
          {{ errors['status'][0] }}
        </p>
      </div>
    </UiCard>
  </div>
</template>

<script>
export default {
  name: 'ServiceStatus',
  props: {
    modelValue: {
      type: [Number, Boolean],
      required: false,
      default: false,
    },
    errors: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
};
</script>
