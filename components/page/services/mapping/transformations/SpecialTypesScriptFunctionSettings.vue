<template>
  <UiLoading v-if="$fetchState.pending || isLoading" class="relative h-20" />

  <div v-else>
    <span v-if="!selectableScripts.length">
      No scripts available to select.
    </span>

    <template v-else>
      <FormElement
        v-model="selectedScriptId"
        title="script_id"
        label="Select Custom Script"
        :errors="errors"
        v-slot="{ inputProps, inputEvents }"
      >
        <select class="w-full" v-bind="inputProps" v-on="inputEvents">
          <option
            v-for="script in selectableScripts"
            :key="script.id"
            :value="script.id"
          >
            {{ script.name }}
          </option>
        </select>
      </FormElement>
      <div v-if="selectedScript">
        <span class="text-sm text-gray-500">
          {{ selectedScript.description }}
        </span>
        <PageServicesMappingTransformationsScriptFunctionVariable
          v-for="(variable, index) in scriptVariables"
          :key="variable.id"
          v-model="scriptVariables[index]"
          :from-schema="sourceSchema"
          :is-removable="false"
          :read-only="index === 0"
        />
        <div v-if="selectedScript" class="mt-5 mb-5">
          <FormElement title="script_code" label="Script Code">
            <MonacoEditor
              v-model="selectedScript.script_code"
              :lang="getEditorCustomScriptLanguage(selectedScript.language)"
              :options="{ readOnly: true, tabSize: 2, wordWrap: 'on', automaticLayout: true }"
              class="h-40 w-full"
            />
          </FormElement>
        </div>
        <div class="flex">
          <NuxtLink
            :to="{
              name: 'settings-manage-scripts-scriptId',
              params: { scriptId: selectedScriptId },
            }"
            target="_blank"
            class="hover:underline hover:underline-offset-2"
          >
            Click here to modify this custom script.
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { transformationsFunctionSettingsMixin } from '@/mixins/transformations/transformations-function-settings-mixin';
import { getEditorCustomScriptLanguage } from '@/lib/customScripting';

export default {
  name: 'ScriptFunctionSettings',
  mixins: [transformationsFunctionSettingsMixin],

  data() {
    return {
      selectedScriptId: null,
      customScripts: [],
      scriptVariables: [],
      isLoading: false,
    };
  },

  setup() {
    return {
      getEditorCustomScriptLanguage,
    };
  },

  async fetch() {
    await this.getCustomScripts();
    if (this.selectedFunction.options.custom_script_id) {
      this.selectedScriptId = this.selectedFunction.options.custom_script_id;
      this.generateVariables();
    }
  },

  computed: {
    ...mapState(useMappingTransformationsStore, {
      selectedField: 'selectedField',
      sourceSchema: 'sourceSchema',
      selectedFunction: 'selectedFunction',
    }),
    selectedScript() {
      if (this.selectedScriptId) {
        return this.customScripts.find((script) => {
          return parseInt(script.id) === parseInt(this.selectedScriptId);
        });
      }

      return null;
    },
    selectableScripts() {
      return this.customScripts.filter(
        (customScript) => customScript.script_level !== 'payload_level'
      );
    },
  },

  watch: {
    scriptVariables: {
      immediate: true,
      deep: true,
      handler() {
        this.updateParentFunctionSettings();
      },
    },
    selectedScriptId: {
      immediate: true,
      handler() {
        this.handleScriptSelection();
      },
    },
  },

  methods: {
    async getCustomScripts() {
      this.isLoading = true;
      try {
        this.customScripts = await useFabric(
          `/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts`
        ).then((r) => r.data);
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed to get Custom Scripts: ${error}`,
          },
          4000
        );
      }
      this.isLoading = false;
    },
    handleScriptSelection() {
      if (this.selectedScript) {
        this.generateVariables();
        this.updateParentFunctionSettings();
      }
    },
    generateVariables() {
      const options = [];
      const additionalInputs = [];

      if (
        this.selectedFunction &&
        this.selectedFunction.options.custom_script_id === this.selectedScriptId
      ) {
        Object.keys(this.selectedFunction.options).forEach((key) => {
          if (key.startsWith('variable_')) {
            options.push({
              id: key.split('_')[1],
              type: 'customerValue',
              value: this.selectedFunction.options[key],
            });
          }
        });
        if (this.selectedFunction.additional_inputs) {
          Object.keys(this.selectedFunction.additional_inputs).forEach(
            (key) => {
              if (key.startsWith('variable_')) {
                additionalInputs.push({
                  id: key.split('_')[1],
                  type: 'mappingField',
                  value: this.selectedFunction.additional_inputs[key],
                });
              }
            }
          );
        }
        this.scriptVariables = [...options, ...additionalInputs].sort((a, b) =>
          a.id > b.id ? 1 : -1
        );
      } else {
        this.scriptVariables = [];
        for (let i = 0; i < this.selectedScript.total_params; i++) {
          this.addDefaultVariable(i === 0);
        }
      }
    },
    updateVariable(scriptVariable) {
      const idx = this.scriptVariables.findIndex(
        (x) => x.id === scriptVariable.id
      );

      this.scriptVariables[idx] = scriptVariable;
    },
    updateParentFunctionSettings() {
      const options = {};
      const additionalInputs = {};

      options.custom_script_id = this.selectedScriptId;
      this.scriptVariables.forEach((variable) => {
        if (variable.type === 'customerValue') {
          options['variable_' + variable.id] = variable.value;
        } else {
          additionalInputs['variable_' + variable.id] = variable.value;
        }
      });
      this.$emit('additionalInput', additionalInputs);
      this.$emit('update:modelValue', options);
    },
    addDefaultVariable(isFirstVariable) {
      const variableData = {
        id: this.scriptVariables.length + 1,
        type: 'customerValue',
        value: null,
      };
      if (isFirstVariable) {
        variableData.type = 'mappingField';
        variableData.value = this.selectedField
          ? this.selectedField.source_field_path
          : '';
      }
      this.scriptVariables.push(variableData);
    },
  },
};
</script>
