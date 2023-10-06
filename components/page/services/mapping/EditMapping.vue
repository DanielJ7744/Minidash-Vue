<template>
  <div>
    <div>
      <MapEditor
        v-if="type === 'shipment map'"
        v-model="mutableShipmentMap"
        back-text="Return to integrations"
        title="Shipment Data Mapping"
        description="Use the form to the right to add new, or edit existing shipment mapping details."
        :making-request="makingRequest"
        @update="updateShipmentMap"
      />

      <MapEditor
        v-if="type === 'payment map'"
        v-model="mutablePaymentMap"
        title="Payment Data Mapping"
        description="Use the form to the right to add new, or edit existing shipment mapping details."
        :making-request="makingRequest"
        @update="updatePaymentMap"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditMapping',
  props: {
    integration: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    paymentMap: {
      type: Object,
      required: false,
      default: null,
    },
    shipmentMap: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      makingRequest: false,
      mutablePaymentMap: this.paymentMap,
      mutableShipmentMap: this.shipmentMap,
    };
  },
  methods: {
    async updateShipmentMap() {
      try {
        this.makingRequest = true;
        this.mutableShipmentMap = await this.$axios
          .$post(
            `/api/api/v2/integrations/${this.integration.id}/shipment-maps`,
            this.mutableShipmentMap
          )
          .then((r) => r.data);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully updated shipment map.',
          },
          4000
        );
        this.makingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed updating shipment map. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
    async updatePaymentMap() {
      try {
        this.makingRequest = true;
        this.mutablePaymentMap = await this.$axios
          .$post(
            `/api/api/v2/integrations/${this.integration.id}/payment-maps`,
            this.mutablePaymentMap
          )
          .then((r) => r.data);
        this.$notify(
          {
            group: 'notifications',
            type: 'success',
            text: 'Successfully updated payment map.',
          },
          4000
        );
        this.makingRequest = false;
      } catch (error) {
        this.$notify(
          {
            group: 'notifications',
            type: 'error',
            text: `Failed updating payment map. Error: ${error}`,
          },
          4000
        );
        this.makingRequest = false;
      }
    },
  },
};
</script>
