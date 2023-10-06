<template>
  <FlowStepSettingsSidebar text-class="text-sky-700">
    <template #header>
      <Icon :name="flowShapeMeta.connector.icon" size="1.5em" />

      <h6 class="text-sm font-medium">Connector</h6>
    </template>

    <template #default>
      <!-- TODO: form -->
      <SidebarContent>
        <template #default="{ sectionClass }">
          <div :class="sectionClass">
            <FormElement
              v-model="triggerType"
              title="trigger_type"
              label="Trigger type"
              required
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
          <button class="button button-secondary">Cancel</button>
          <button class="button button-primary">Save</button>
        </template>
      </SidebarContent>
    </template>
  </FlowStepSettingsSidebar>
</template>

<script setup lang="ts">
import { flowShapeMeta } from '@/types/core/v1';

const triggerType = ref('Schedule');
</script>
