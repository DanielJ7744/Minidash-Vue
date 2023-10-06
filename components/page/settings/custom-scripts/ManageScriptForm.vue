<template>
  <UiLoading v-if="$fetchState.pending" class="relative h-36" />
  <UiError
    v-else-if="$fetchState.error"
    class="relative h-36"
    message="An error occurred."
  />
  <form v-else @submit.prevent="saveScript">
    <template v-if="scriptFailedAt">
      <div class="flex justify-end">
        <span class="status-badge status-badge--failed"> Build Failed </span>
      </div>
      <hr />
    </template>
    <UiTitledCard title="General">
      <PageSettingsCustomScriptDetailsForm v-model="form" :errors="errors" />
    </UiTitledCard>

    <template v-if="form.language">
      <UiTitledCard title="Input Variables">
        <template #info>
          <p>
            The number of variable fields added and saved here will be available
            when you come to apply this script to field mappings later. However,
            any values entered here are temporary for testing purposes only.
          </p>
        </template>

        <template v-if="!isFieldLevel && scriptVariables.length">
          <label class="font-medium"> Input of transform </label>
          <textarea
            v-if="form.return_type === 'csv'"
            v-model="scriptVariables[0].value"
            class="h-40 w-full"
          />
          <MonacoEditor
            v-else
            v-model="scriptVariables[0].value"
            :lang="form.return_type"
            :options="{
              minimap: { enabled: false },
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }"
            class="h-40 w-full"
          />
        </template>
        <template v-else>
          <div
            v-for="variable in scriptVariables"
            :key="variable.id"
            class="mb-2"
          >
            <label v-if="variable.id === 1" class="font-medium">
              Variable {{ variable.id }} - Initial input of transform
            </label>
            <label v-else class="font-medium">
              Variable {{ variable.id }}
            </label>
            <div class="flex">
              <input
                v-model="variable.value"
                type="text"
                class="w-full flex-1"
              />

              <div v-if="variable.id !== 1" class="flex-none">
                <span
                  class="icon icon--cross m-2 mt-4 cursor-pointer"
                  @click="removeVariable(variable)"
                />
              </div>
            </div>
          </div>
          <div
            v-if="isFieldLevel && scriptVariables.length < 10"
            class="flex justify-end"
          >
            <button
              type="button"
              class="button button-secondary float-right m-2 mt-4"
              @click="addVariable()"
            >
              Add script variable
            </button>
          </div>
        </template>
      </UiTitledCard>
      <UiTitledCard title="Script Code">
        <template #info>
          <p>
            In your code, variables are accessed via the data parameter. Syntax
            will vary depending on the language however, you should always have
            a data parameter for the initial input and any other variables
            added.
          </p>
          <p class="mt-2">
            The first variable is reserved for the initial input value - you
            will see this is added to the code editor as soon as you select a
            coding language. When you apply a custom script to a field mapping,
            the initial input value is always the source field being mapped.
          </p>
          <p v-if="isFieldLevel" class="mt-2">
            You can add up to nine more variables per script. Each time you add
            a variable, an associated data parameter is added to the top of the
            code editor, ready for you to edit.
          </p>
        </template>
        <div>
          <MonacoEditor
            v-model="form.script_code"
            :lang="monacoEditorLanguage"
            class="h-96 w-full"
            @change="toggleCodeHasChanged"
            :options="{ automaticLayout: true, tabSize: 2, wordWrap: 'on' }"
          />
          <div v-if="errors && errors['script_code']">
            <p class="text-danger-600 text-xs">
              {{ errors['script_code'][0] }}
            </p>
          </div>
          <div v-if="scriptId" class="mt-4 flex items-center justify-end">
            <div class="flex gap-x-2">
              <div v-tooltip.top="runTooltipMessage">
                <button
                  type="button"
                  :disabled="preventScriptRun"
                  class="button button-primary button-sm ml-2 md:w-auto"
                  @click="runScript"
                >
                  Run Script
                </button>
              </div>
              <NuxtLink
                tag="button"
                class="button button-secondary button-sm"
                :to="{
                  name: 'settings-manage-scripts-scriptId-audits',
                  params: { scriptId: scriptId },
                }"
              >
                View Changes
              </NuxtLink>
            </div>
          </div>
        </div>
      </UiTitledCard>

      <UiTitledCard
        v-if="scriptTestRun.result || scriptTestRun.isRunning"
        title="Script Return Value"
      >
        <UiLoading v-if="scriptTestRun.isRunning" class="relative" />
        <template v-else>
          <textarea
            v-if="isFieldLevel"
            :value="scriptTestRun.result"
            disabled
          />
          <MonacoEditor
            v-else
            v-model="scriptTestRun.result"
            lang="json"
            id="beeps"
            :options="{
              minimap: { enabled: false },
              readOnly: true,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }"
            class="h-40 w-full"
          />
        </template>
      </UiTitledCard>

      <UiTitledCard v-if="$canViewDetailedLogs" title="Logs">
        <div v-if="!showScriptLogs" class="flex justify-center">
          <button
            type="button"
            class="button button-primary"
            @click="showScriptLogs = true"
          >
            Get logs
          </button>
        </div>
        <PageSettingsCustomScriptsScriptLogs
          v-else
          :custom-script-url="scriptUrl"
        />
      </UiTitledCard>
    </template>

    <div class="flex items-end justify-between">
      <div>
        <button
          v-if="scriptId"
          type="button"
          :disabled="isLoading"
          class="button button-danger ml-2 w-full md:w-auto"
          @click="openConfirmationModal"
        >
          Delete Script
        </button>
      </div>
      <div />
      <div class="align-center mt-2 flex justify-end">
        <NuxtLink
          :to="{
            path: '/settings/manage-scripts',
          }"
        >
          <button type="button" class="button button-secondary px-5">
            Cancel
          </button>
        </NuxtLink>
        <button
          v-if="form.language"
          type="submit"
          :disabled="isLoading"
          class="button button-primary relative ml-2 w-full md:w-auto"
        >
          <uiSpinner
            v-if="isLoading"
            text-class="text-white"
            class="relative w-auto"
          />
          <p v-else>Save Script</p>
        </button>
      </div>
    </div>

    <Modal
      id="deletePreventModal"
      title="Script is still in use"
      classes="modal--medium-tall"
    >
      <PageSettingsCustomScriptDeletePreventionModal
        :services="servicesUsingScript"
      />
    </Modal>

    <Modal id="deleteConfirmation" title="Are you sure?" classes="modal--small">
      <LegacyDeleteConfirmationModal
        warning-text="Where this custom script has been used for a service, either in field mappings or as payload script, this service or its mappings may not work as expected next time the service runs."
        delete-explanation="If you are in any doubt as to whether this script is being used in a service, please cancel this operation and check your service first."
        confirmation-label="If you are satisfied that this script is not being used and you are ready to delete it, please type confirm in the field below."
        @deleteCancel="closeModal"
        @deleteConfirm="deleteScript"
      />
    </Modal>
  </form>
</template>

<script>
import { mapActions } from 'pinia';
import { getEditorCustomScriptLanguage } from '~/lib/customScripting';

export default {
  name: 'ManageScriptForm',
  props: {
    scriptId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
      form: {
        script_code: '',
        name: null,
        description: null,
        language: null,
        default_fail_value: null,
        script_level: 'field_level',
        return_type: 'string',
      },
      scriptAudits: null,
      scriptFailedAt: null,
      scriptVariables: [],
      scriptTestRun: {
        initInput: null,
        result: null,
        isRunning: false,
      },
      errors: {},
      servicesUsingScript: null,
      codeHasChanged: false,
      showScriptLogs: false,
      scriptUrl: null,
    };
  },
  async fetch() {
    if (!this.scriptId) {
      return;
    }
    const script = await this.$axios
      .$get(`${this.url}/${this.scriptId}`)
      .then((r) => r.data);
    this.form.script_code = script.script_code;
    this.form.name = script.name;
    this.form.description = script.description;
    this.form.language = script.language;
    this.form.default_fail_value = script.default_fail_value;
    this.form.return_type = script.return_type;
    this.form.script_level = script.script_level;
    this.scriptUrl = script.script_url ?? null;
    this.scriptVariables = [...Array(script.total_params)].map((_, i) => {
      return {
        id: i + 1,
        value: null,
      };
    });
    this.servicesUsingScript = await fetchAllPaginatedResults(
      this.$axios,
      'api/api/v2/services',
      {
        perPage: 100,
        include: 'settings',
        'filter[settings.custom_script_id]': this.scriptId,
      }
    );
  },
  computed: {
    url() {
      return `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts`;
    },
    scriptLevel() {
      return this.form.script_level;
    },
    isFieldLevel() {
      return this.scriptLevel === 'field_level';
    },
    scriptLanguage() {
      return this.form.language;
    },
    scriptPayload() {
      return {
        total_params: this.scriptVariables.length,
        ...this.form,
      };
    },
    monacoEditorLanguage() {
      return getEditorCustomScriptLanguage(this.scriptLanguage);
    },
    scriptRunPayload() {
      const options = {
        custom_script_id: this.scriptId,
        output_debug: true,
      };

      if (this.scriptVariables.length > 1) {
        const remainingScriptVariables = this.scriptVariables.slice(1);
        remainingScriptVariables.forEach((variable) => {
          options['variable_' + variable.id] = variable.value;
        });
      }

      return {
        data: {
          input: this.scriptVariables[0].value,
          scripts: [
            {
              script_id: 51,
              options,
            },
          ],
        },
      };
    },
    scriptHasBeenRun() {
      return this.scriptTestRun.result || this.scriptTestRun.isRunning;
    },
    scriptVariablesHaveValue() {
      return (
        this.scriptVariables.filter((scriptVariable) => !!scriptVariable.value)
          .length > 0
      );
    },
    preventScriptRun() {
      return (
        this.scriptTestRun.isRunning ||
        this.isLoading ||
        this.codeHasChanged ||
        !this.scriptVariablesHaveValue
      );
    },
    runTooltipMessage() {
      const message = [];
      if (!this.scriptVariablesHaveValue) {
        message.push('Please enter a value for all script variables.');
      }

      if (this.codeHasChanged) {
        message.push('Please save your changes.');
      }

      return message.join(' ');
    },
  },
  watch: {
    scriptLanguage(newValue, oldValue) {
      if (!oldValue && this.form.script_code) {
        return;
      }
      this.addDefaultLanguageCode();
    },
    scriptLevel(newValue) {
      this.form.return_type = newValue === 'payload_level' ? 'json' : 'string';
    },
  },
  methods: {
    ...mapActions(useUiStore, ['closeModal', 'openModal']),
    addDefaultLanguageCode() {
      this.scriptVariables = [];
      this.scriptVariables.push({
        id: this.scriptVariables.length + 1,
        value: null,
      });
      this.form.script_code = this.generateLanguageVariable('variable_1', true);
    },
    addVariable() {
      this.scriptVariables.push({
        id: this.scriptVariables.length + 1,
        value: null,
      });
      let explodedScriptCode = this.form.script_code.split('\n');
      explodedScriptCode.splice(
        this.scriptVariables.length,
        0,
        this.generateLanguageVariable(`variable_${this.scriptVariables.length}`)
      );
      explodedScriptCode = explodedScriptCode.filter(
        (codeLine) => codeLine !== ''
      );
      this.form.script_code = explodedScriptCode.join('\n');
    },
    removeVariable(scriptVariableToRemove) {
      const scriptVariableIndex = this.scriptVariables.findIndex(
        (scriptVariable) => scriptVariable.id === scriptVariableToRemove.id
      );
      if (!scriptVariableIndex) {
        return;
      }
      this.scriptVariables.splice(scriptVariableIndex, 1);
      const explodedScriptCode = this.form.script_code.split('\n');
      const generatedVariable = this.generateLanguageVariable(
        `variable_${scriptVariableIndex + 1}`
      );
      const variableIndex = explodedScriptCode.findIndex(
        (codeLine) => codeLine === generatedVariable
      );
      if (variableIndex === -1) {
        this.notify(
          'error',
          'Failed to remove script variable, please remove this manually.'
        );
      }
      explodedScriptCode.splice(variableIndex, 1);
      this.form.script_code = explodedScriptCode.join('\n');
    },
    async saveScript() {
      this.isLoading = true;
      try {
        const response = !this.scriptId
          ? await this.$axios
              .$post(this.url, this.scriptPayload)
              .then((r) => r.data)
          : await this.$axios
              .$patch(`${this.url}/${this.scriptId}`, this.scriptPayload)
              .then((r) => r.data);

        this.notify('success', 'Successfully saved Custom Script');

        this.codeHasChanged = false;

        navigateTo({
          name: 'settings-manage-scripts-scriptId',
          params: {
            scriptId: response.id,
          },
        });
      } catch (error) {
        this.notify('error', `Failed to save Custom Script: ${error}`);
        this.errors = error.response.data.errors;
      }
      this.isLoading = false;
    },
    openConfirmationModal() {
      if (!this.servicesUsingScript.length) {
        this.openModal('deleteConfirmation');
        return;
      }
      this.openModal('deletePreventModal');
    },
    async deleteScript() {
      this.closeModal();
      this.isLoading = true;
      try {
        await this.$axios.$delete(`${this.url}/${this.scriptId}`);
        this.notify('success', 'Successfully deleted Custom Script');
        navigateTo({ name: 'settings-manage-scripts' });
      } catch (error) {
        this.notify('error', `Failed to delete Custom Script: ${error}`);
      }
      this.isLoading = false;
    },
    async runScript() {
      if (!this.scriptId) {
        this.notify(
          'error',
          'Please ensure script is saved before attempting to run.'
        );
        return;
      }

      try {
        this.scriptTestRun.isRunning = true;
        this.scriptTestRun.result = null;

        const response = await this.$axios
          .$post(
            '/api/api/v1/transform-scripts/run-scripts',
            this.scriptRunPayload
          )
          .then((r) => r.result);

        this.notify('success', 'Custom Script Test Run successful');
        this.scriptTestRun.isRunning = false;
        this.scriptTestRun.result = response.result;
      } catch (error) {
        this.notify('error', `Failed to run Custom Script: ${error}`);
        this.scriptTestRun.isRunning = false;
      }
    },
    notify(type, text) {
      this.$notify({ group: 'notifications', type, text }, 4000);
    },
    generateLanguageVariable(varName, isInitVal = false) {
      switch (this.form.language) {
        case 'node':
        case 'node16':
        case 'node17':
          if (isInitVal) {
            return `const ${varName} = event.body.init_input;\n\nreturn true;\n`;
          }
          return `const ${varName} = data.${varName};`;
        case 'php':
        case 'php7':
        case 'php8':
          if (isInitVal) {
            return `<?php\n$${varName} = $data->init_input;\n\nreturn true;\n`;
          }
          return `$${varName} = $data->${varName};`;
        case 'python':
        case 'python3':
          if (isInitVal) {
            return `${varName} = body.init_input\n`;
          }
          return `${varName} = body.${varName}`;
        case 'ruby':
          if (isInitVal) {
            return `${varName} = body[:init_input]\n`;
          }
          return `${varName} = body[:${varName}]`;
        case 'go':
          if (isInitVal) {
            return `var ${varName} = body.init_input\n`;
          }
          return `var ${varName} = body.${varName}`;
        case 'java':
        case 'java11':
          if (isInitVal) {
            return `String ${varName} = $body['init_input'];\n`;
          }
          return `String ${varName} = $body['${varName}'];`;
        case 'csharp':
          if (isInitVal) {
            return `string ${varName} = $body.init_input;\n`;
          }
          return `string ${varName} = $body.${varName};`;
        default:
          return `${varName} = body.${varName};`;
      }
    },
    toggleCodeHasChanged() {
      this.codeHasChanged = true;
    },
  },
};
</script>
