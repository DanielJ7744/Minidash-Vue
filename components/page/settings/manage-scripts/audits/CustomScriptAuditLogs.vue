<template>
  <div v-if="parsedAudits.length">
    <UiLoading v-if="isMakingRequest" class="relative h-36" />
    <template v-else>
      <div class="grid grid-cols-3">
        <div class="col-span-1"><h3 class="h6">Audit Created</h3></div>
        <div class="col-span-2"><h3 class="h6">Changes</h3></div>
      </div>

      <hr />

      <div
        v-for="audit in pairedParsedAudits"
        :key="`auditList+${audit.id}`"
        class="grid grid-cols-3 border-b py-5"
      >
        <div
          class="col-span-1 capitalize flex flex-col justify-between"
        >
          <div class="text-sm">
            {{ fromNow(audit.created_at) }}
          </div>
          <div>
            <button
              type="button"
              class="button button-primary button-sm"
              @click="openRestoreConfirmModal(audit.old_values)"
            >
              Restore Version
            </button>
          </div>
        </div>
        <div class="col-span-2">
          <PageSettingsManageScriptsAuditsAuditLogDifference
            v-for="(pairedValuesPair, pairedValuesKey) in audit.paired_values"
            :key="`auditListValues+${audit.id}+${pairedValuesKey}`"
            :new-value="pairedValuesPair.new_value"
            :old-value="pairedValuesPair.old_value"
            :field-name="pairedValuesKey"
            :script-language="scriptLanguageForEditor"
            class="max-h-60 overflow-y-auto mb-4 overflow-x-hidden"
          />
        </div>
      </div>
    </template>

    <Modal
      id="restoreConfirmModal"
      title="Are you sure?"
      classes="modal--medium-tall"
    >
      <PageSettingsManageScriptsAuditsRestoreAuditVersionModal
        :old-values-to-be-restored="oldValuesToRestore"
        :script-language="scriptLanguageForEditor"
        @restoreConfirm="restoreScriptVersion"
      />
    </Modal>
  </div>
  <div v-else>No audits found.</div>
</template>

<script>
import clone from 'just-clone';
import { mapActions } from 'pinia';
import { getEditorCustomScriptLanguage } from '@/lib/customScripting';

export default {
  name: 'CustomScriptAuditLogs',
  props: {
    audits: {
      type: Array,
      required: true,
    },
    script: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isMakingRequest: false,
      oldValuesToRestore: {},
    };
  },
  computed: {
    auditsToShow() {
      const clonedAudits = clone(this.audits);

      return clonedAudits
        .filter(
          clonedAudit =>
            clonedAudit.event === 'updated' &&
            clonedAudit.new_values !== '[]' &&
            clonedAudit.old_values !== '[]'
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    parsedAudits() {
      return this.auditsToShow.map(audit => {
        audit.new_values = JSON.parse(audit.new_values);
        if (audit.new_values.script_code) {
          audit.new_values.script_code = atob(audit.new_values.script_code);
        }
        if (audit.new_values.script_url) {
          delete audit.new_values.script_url;
        }
        audit.old_values = JSON.parse(audit.old_values);
        if (audit.old_values.script_code) {
          audit.old_values.script_code = atob(audit.old_values.script_code);
        }
        if (audit.old_values.script_url) {
          delete audit.old_values.script_url;
        }

        return audit;
      });
    },
    pairedParsedAudits() {
      return this.parsedAudits.map(parsedAudit => {
        const pairedAudit = {
          id: parsedAudit.id,
          created_at: parsedAudit.created_at,
          old_values: parsedAudit.old_values,
        };

        const pairedValues = {};
        for (const [key, value] of Object.entries(parsedAudit.old_values)) {
          if (!(key in parsedAudit.new_values)) {
            continue;
          }

          const formattedKey = key.replace('_', ' ');
          pairedValues[formattedKey] = {
            old_value: value,
            new_value: parsedAudit.new_values[key],
          };
        }

        pairedAudit.paired_values = pairedValues;

        return pairedAudit;
      });
    },
    scriptLanguageForEditor() {
      return getEditorCustomScriptLanguage(this.script.language);
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal']),
    openRestoreConfirmModal(valuesToRestore) {
      this.oldValuesToRestore = valuesToRestore;
      this.openModal('restoreConfirmModal');
    },
    async restoreScriptVersion() {
      this.isMakingRequest = true;
      try {
        await this.$axios.$patch(
          `/api/api/v1/transform-scripts/company/${this.$auth.user.company_id}/custom_scripts/${this.script.id}`,
          this.oldValuesToRestore
        );

        this.$notify({
          group: 'notifications',
          type: 'success',
          text: 'Successfully restored Custom Script.',
        });

        navigateTo({
          name: 'settings-manage-scripts-scriptId',
          params: {
            scriptId: this.script.id
          }
        });
      } catch (error) {
        this.$notify({
          group: 'notifications',
          type: 'error',
          text: `Failed restoring Custom Script. Error: ${error}`,
        });
      }
      this.isMakingRequest = false;
    },
  },
};
</script>
