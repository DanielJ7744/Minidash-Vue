export const entitiesHelperMixin = {
  data () {
    return {
      serviceLogData: [],
      serviceLogDataLoaded: false
    }
  },
  methods: {
    getEntityIconClass (entityDatabaseName) {
      switch (entityDatabaseName) {
        case 'Orders':
        case 'Order':
          return 'icon icon--cart'
        case 'Returns':
        case 'Return':
          return 'icon icon--truck'
        case 'Products':
        case 'Product':
          return 'icon icon--book'
        case 'Customers':
        case 'Customer':
          return 'icon icon--user'
        case 'Credit Memos':
        case 'Credit Memo':
          return 'icon icon--file-text2'
        case 'Fulfilments':
        case 'Fulfilment':
          return 'icon icon--parcel'
        case 'Receipts':
        case 'Receipt':
          return 'icon icon--checkmark'
        case 'Stock':
          return 'icon icon--checklist'
        case 'Purchase Orders':
        case 'Purchase Order':
        case 'Transfer Orders':
        case 'Transfer Order':
        case 'Wholesale Orders':
        case 'Wholesale Order':
          return 'icon icon--file-text'
        case 'Refunds':
        case 'Refund':
          return 'icon icon--dice'
        case 'Addresses':
        case 'Address':
          return 'icon icon--addresses'
        default:
          return 'icon icon--parcel'
      }
    },
    getServiceLogData (usernamesAndRunIds) {
      const serviceLogPromises = this.getServiceLogPromises(usernamesAndRunIds)
      const failedPromises = []
      Promise.allSettled(serviceLogPromises).then((results) => {
        results.forEach((result) => {
          if (result.status !== 'fulfilled') {
            failedPromises.push(result)
          } else {
            this.serviceLogData.push(result.value.data)
          }
        })
        this.serviceLogDataLoaded = true
        if (failedPromises.length !== 0) {
          this.displayFailedResults(failedPromises)
        }
      })
    },
    getServiceLogPromises (usernamesAndRunIds) {
      const serviceLogPromises = []

      for (const runIds of Object.values(usernamesAndRunIds)) {
        runIds.forEach((runId) => {
          serviceLogPromises.push(
            this.$axios.$get(`/api/api/v2/service-logs/${runId}`)
          )
        })
      }

      return serviceLogPromises
    },
    displayFailedResults (results) {
      results.forEach((failedResponse) => {
        this.$notify({ group: 'notifications', type: 'error', text: failedResponse.reason.message }, 4000)
      })
    }
  }
}
