<template>
  <div class="flex flex-grow flex-col p-4 pb-32">
    <div class="flex flex-col">
      <h4 class="pb-3 font-normal">
        {{ title }}
      </h4>
    </div>
    <div class="mt-4 grid grid-cols-1 rounded border">
      <div class="m-2 border-b">
        <p class="m-0 font-medium">Stockr order total:</p>
        <p>{{ total }}</p>
      </div>
      <div class="mx-2">
        <p class="m-0 font-medium">Stockr charge:</p>
        <p>
          <span class="font-medium">£</span>
          {{ pricePerTransaction }} per order
        </p>
      </div>
      <div class="m-2 border-t">
        <p class="m-0 font-medium">Stockr total:</p>
        <p>
          <span class="font-medium">£</span>
          {{ totalCosting }}
        </p>
      </div>
      <div class="m-2 border-t">
        <div class="mx-auto flex flex-col">
          <div class="mx-auto w-full p-1.5 md:w-auto">
            <MultiSelect
              class="w-full"
              v-model="stores"
              :options="storeData"
              optionLabel="store_url"
              optionValue="store_id"
              placeholder="Select stores"
            />
          </div>
          <div>
            <UiDropdownMenu
              class="w-full"
              title="Download CSV"
              v-slot="{ open, buttonProps, buttonEvents }"
              :links="[
                {
                  title: 'Download as CSV',
                  action: () => launchDownloadCsv(),
                },
              ]"
            >
              <FormDropdownButton
                class="button button-secondary button-sm float-right mt-4 h-full w-full md:w-auto"
                v-bind="buttonProps"
                :open="open"
                v-on="buttonEvents"
              >
                <p class="m-0 w-full">
                  <span class="icon icon--download3" style="font-size: 16px" />
                </p>
              </FormDropdownButton>
            </UiDropdownMenu>
          </div>
        </div>
        <Modal id="downloadCsv" title="Download as CSV?" classes="modal--small">
          <p class="mb-5">
            {{ this.getStoreAmountValue }}
          </p>
          <div>
            <a
              class="button float-right flex pb-1"
              target="_blank"
              v-if="csvDownloadLink"
              :href="csvDownloadLink"
              >Download CSV</a
            >
          </div>
          <UiLoading v-if="isDownloading" class="relative h-36 pb-5" />
          <div>
            <button
              type="button"
              class="button button-secondary"
              @click="closeModal()"
            >
              Cancel
            </button>
            <a
              class="button button-primary"
              type="button"
              style="min-width: 102px"
              target="_blank"
              @click="downloadCsv()"
            >
              Export
            </a>
          </div>
        </Modal>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from 'pinia';

export default {
  name: 'summaryTotalCard',
  data() {
    return {
      stores: null,
      isDownloading: false,
      csvDownloadLink: null,
    };
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    totalCosting: {
      type: Number,
      default: 0,
    },
    pricePerTransaction: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    storeData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    ...mapActions(useUiStore, ['openModal', 'closeModal']),
    launchDownloadCsv() {
      if (this.stores) {
        this.isDownloading = false;
        return this.openModal('downloadCsv');
      }

      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: 'Sorry, no stores selected for export',
        },
        4000
      );
    },
    async downloadCsv() {
      this.isDownloading = true;
      try {
        const response = await this.$axios.get(this.stockrCsvUrl());
        this.csvDownloadLink = response.data;
        this.isDownloading = false;
      } catch (error) {
        this.isDownloading = false;
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Could not load data from Stockr ${error}`,
          },
          4000
        );
      }
    },
    stockrCsvUrl() {
      return `/api/api/v1/stockr/api/v1/dashboard/detailed-logs?download=yes${this.generateUrlParams()}`;
    },
    generateUrlParams() {
      let query = '';
      const params = {
        company_id: this.companyId,
        start_datetime: this.startDate,
        end_datetime: this.endDate,
      };
      for (const i in params) {
        query += `&${i}=${params[i]}`;
      }
      const storeIds = this.checkedStoreIds;

      if (storeIds.length !== 0) {
        const storesIdArr = 'store_id[]=' + storeIds.join('&store_id[]=');
        query += `&${storesIdArr}`;
      }
      return query;
    },
  },
  computed: {
    checkedStoreNames() {
      return this.storeData
        .filter((item) => item.checked)
        .map((name) => name.store_url);
    },
    checkedStoreIds() {
      return JSON.parse(JSON.stringify(this.stores));
    },
    getStoreAmountValue() {
      let storeVal = JSON.parse(JSON.stringify(this.stores));
      if (storeVal.length < 1) {
        return 'All stores will be downloaded';
      }
      return storeVal.length + ' stores selected to download';
    },
  },
};
</script>
