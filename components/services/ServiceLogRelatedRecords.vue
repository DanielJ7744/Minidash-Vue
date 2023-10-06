<template>
  <!-- <UiLoading v-if="$fetchState.pending" class="relative h-36" /> -->
  <!-- <UiError v-else-if="$fetchState.error" class="relative h-36" message="An error occurred." /> -->
  <div>
    <div class="container pt-5">
      <div>
        <h6 class="h6">Detailed Service Logs</h6>
      </div>
      <PageConnectionsServicesRunLogTable :run-id="serviceLog.id" />
    </div>
    <hr />
    <div>
      <div>
        <div>
          <h4>Related {{ relatedRecordName }}</h4>
        </div>
        <div v-if="!serviceLogEntities.length">
          <h6>No related records found</h6>
        </div>
        <div v-else>
          <div class="grid grid-cols-5 py-3 text-center font-medium">
            <div>Name</div>
            <div>Unique ID</div>
            <div>Status</div>
            <div>Date Recorded</div>
            <div>Extra Details</div>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div
              v-for="(
                serviceLogEntity, serviceLogEntityIndex
              ) in serviceLogEntities"
              :key="serviceLogEntityIndex"
              class="grid grid-cols-5 border-t border-solid py-3 text-center"
            >
              <div>
                {{ serviceLogEntity.common_ref }}
              </div>
              <div>
                {{ serviceLogEntity.source_id }}
              </div>
              <div>
                {{ serviceLogEntity.status | removeInitialUnderscore }}
              </div>
              <div>
                {{ serviceLogEntity.created_at }}
              </div>
              <div
                v-if="
                  serviceLogEntity.error &&
                  (serviceLogEntity.error !== 'Ok' ||
                    serviceLogEntity.error !== '')
                "
              >
                {{ serviceLogEntity.error }}
              </div>
              <div v-else>
                {{ serviceLogEntity.message }}
              </div>
            </div>
            <div
              class="p inset-x-0 bottom-0 my-5 flex items-center justify-end gap-x-2 pr-5"
            >
              <div v-if="loadingMoreResults" class="message message--loading">
                Loading more results...
              </div>
              <div>
                <button
                  type="button"
                  class="button button-secondary"
                  :disabled="!hasMoreEntityResults"
                  @click="loadMoreResults()"
                >
                  Load More Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pluralize from 'pluralize';

export default {
  name: 'ServiceLogRelatedRecords',
  props: {
    serviceLog: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loadingMoreResults: false,
      serviceLogEntities: [],
    };
  },
  async fetch() {
    const firstRunIdFilter = `filter[type]=${this.serviceLogSourceEntity}&filter[first_run_id]=${this.serviceLog.id}`;
    const lastRunIdFilter = `filter[type]=${this.serviceLogSourceEntity}&filter[last_run_id]=${this.serviceLog.id}`;
    const firstRunEntities = await this.$axios
      .$get(`/api/api/v2/sync-reports?${firstRunIdFilter}`)
      .then((r) => r.data);
    const lastRunEntities = await this.$axios
      .$get(`/api/api/v2/sync-reports?${lastRunIdFilter}`)
      .then((r) => r.data);
    this.serviceLogEntities = this.serviceLogEntities.concat(firstRunEntities);
    this.serviceLogEntities = this.serviceLogEntities.concat(lastRunEntities);
    this.serviceLogEntities = this.serviceLogEntities.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (entity) =>
            entity.place === value.place &&
            entity.common_ref === value.common_ref
        )
    );
  },
  computed: {
    serviceLogSourceEntity() {
      if (this.serviceLog?.service?.source_entity?.name) {
        return pluralize.singular(
          this.serviceLog?.service?.source_entity?.name
        );
      }
      return null;
    },
    relatedRecordName() {
      return this.serviceLog?.service?.source_entity?.name ?? 'Records';
    },
  },
  methods: {
    loadMoreResults() {
      if (!this.hasMoreEntityResults) {
        return;
      }
      this.hasMoreEntityResults = false;
      this.loadingMoreResults = true;
      this.serviceLogEntitiesPage += 1;
      this.loadServiceLogData(this.serviceLogEntitiesPage);
    },
  },
};
</script>
