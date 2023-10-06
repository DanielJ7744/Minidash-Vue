<template>
  <div>
    <div class="mb-1 text-base capitalize text-black">
      {{ fieldName }}
    </div>
    <MonacoDiffEditor
      v-if="fieldName === 'script code'"
      :language="scriptLanguage"
      :modelValue="newValue"
      :original="oldValue"
      :options="{ readOnly: true }"
      class="h-52 w-full"
    />
    <div v-else class="grid grid-cols-5 rounded-md border p-2">
      <div class="col-span-2 flex items-center justify-center">
        {{ oldValue }}
      </div>
      <div class="col-span-1 flex items-center justify-center text-lg">
        <div class="icon icon--arrow-right" />
      </div>
      <div class="col-span-2 flex items-center justify-center">
        {{ newValue }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuditLogDifference',
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    oldValue: {
      type: String,
      required: true,
    },
    newValue: {
      type: String,
      required: true,
    },
    scriptLanguage: {
      type: String,
      required: true,
    },
  },
};
</script>
