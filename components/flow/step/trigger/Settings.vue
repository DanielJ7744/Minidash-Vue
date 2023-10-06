<template>
  <FlowStepSettingsSidebar text-class="text-purple-700">
    <template #header>
      <Icon :name="flowShapeMeta.trigger.icon" size="1.5em" />

      <h6 class="text-sm font-medium">Trigger</h6>
    </template>

    <template #default>
      <SidebarContent @submit="() => handleSubmit()">
        <template #default="{ sectionClass }">
          <div :class="sectionClass">
            <FormElement
              v-model="triggerType"
              title="trigger_type"
              label="Trigger type"
              required
              :disabled="submitting"
              v-slot="{ inputProps, inputEvents }"
            >
              <select v-bind="inputProps" v-on="inputEvents">
                <option
                  v-for="triggerType in ['Schedule', 'Webhook']"
                  :key="triggerType"
                  :value="triggerType"
                  v-text="triggerType"
                />
              </select>
            </FormElement>
          </div>
        </template>

        <template #footer>
          <button
            class="button button-secondary"
            type="button"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button class="button button-primary" :disabled="submitting">
            Save
          </button>
        </template>
      </SidebarContent>
    </template>
  </FlowStepSettingsSidebar>
</template>

<script setup lang="ts">
import { flowShapeMeta } from '@/types/core/v1';

const triggerType = shallowRef('Schedule');
const submitting = shallowRef(false);

const handleSubmit = async () => {
  submitting.value = true;
  await new Promise((r) => setTimeout(r, 2000));
  submitting.value = false;
};
</script>
