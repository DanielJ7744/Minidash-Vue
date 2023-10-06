import Systems from '@/enums/Systems'

/**
 * Get the system specific authentication failure info
 *
 * @param {Object} system
 * @param {String} authenticationType
 * @returns {String}
 */
const authenticationFailedInfo = (system, authenticationType) => {
  switch (system.name) {
    case Systems.NETSUITE:
      return {
        message: 'Authorisation Failed - Please make sure you have installed the Patchworks bundle',
        link: 'https://wearepatchworks.gitbook.io/dashboard/systems/netsuite'
      }
    case Systems.SHOPIFY:
      switch (authenticationType) {
        case 'basic_auth':
          return {
            message: 'Authorisation Failed - Please make sure you have configured the Patchworks private Shopify app',
            link: 'https://wearepatchworks.gitbook.io/dashboard/systems/shopify-shopify+'
          }
        case 'oauth2':
          return {
            message: 'Authorisation Failed - Please make sure you have installed the Patchworks Shopify app'
          }
        default:
          return {
            message: 'Please check through all fields and confirm that they are correct. If they are, please contact support and they will be able to look into the issue.'
          }
      }
    default:
      return {
        message: 'Authorisation Failed - Please check through all fields and confirm that they are correct. If they are, please contact support and they will be able to look into the issue.'
      }
  }
}

export {
  authenticationFailedInfo
}
