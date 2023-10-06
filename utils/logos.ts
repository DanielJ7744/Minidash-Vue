const LOGOS: string[] = [
  '3pl',
  'amazon',
  'akeneo',
  'bi',
  'bigcommerce',
  'bleckmann',
  'brightpearl',
  'cegid',
  'channelunity',
  'clover',
  'commercetools',
  'csv',
  'cybertill',
  'demandware',
  'dynamics_nav',
  'dynamicsnav',
  'emarsys',
  'eposnow',
  'farfetch',
  'fashionmaster',
  'globale',
  'inbound_api',
  'inboundapi',
  'joor',
  'json',
  'khaos',
  'kuehnenagel',
  'lightspeed',
  'linnworks',
  'magento',
  'mirakl',
  'netsuite',
  'ometria',
  'ometriafilepull',
  'opsuite',
  'patchworks',
  'peoplevox',
  'plytix',
  'prestashop',
  'prima_solutions',
  'radial',
  'rebound',
  's3',
  'sage',
  'salesforce',
  'sap_business_one',
  'sap',
  'seko_api',
  'seko',
  'sftp',
  'shopify',
  'shopifyplus',
  'sitoo',
  'snapfulfil',
  'sorted',
  'spark_layer',
  'syteline',
  'tiktok_shop',
  'toll',
  'torque',
  'txt',
  'veeqo',
  'visual2000',
  'visualnext',
  'visualsoft',
  'volusion',
  'voyado',
  'woocommerce',
  'xero',
  'xml',
  'xstore',
  'yotpo',
  'zigzag',
  'odoo',
  'activeants',
];

const DEFAULT_IMAGE = '/images/systems/default.png';

/**
 * Generate the file path for an svg logo
 */
const svgPath = (filename: string): string => {
  return `/images/systems/${filename}.svg`;
};

/**
 * Retrieve the logo image for a system
 */
const getSystemLogo = (systemName: string | null = null): string => {
  if (!systemName) {
    return DEFAULT_IMAGE;
  }

  try {
    const filename = `${systemName.toLowerCase().replaceAll(' ', '_')}`;

    switch (filename) {
      case 'bleckmann':
      case 'bleckmann_(api_version)':
      case 'bleckmann_(sftp_version)':
      case 'bleckmann_returns':
        return svgPath('bleckmann');
      case 'brightpearl':
      case 'brightpearlv2':
        return svgPath('brightpearl');
      case 'magento':
      case 'magento2':
      case 'magento_2':
      case 'magentotwo':
        return svgPath('magento');
      case 'netsuite':
      case 'netsuite_rest':
      case 'netsuite_soap':
      case 'netsuite_suitetalk':
        return svgPath('netsuite');
      case 'vend':
      case 'lightspeed':
      case 'lightspeed_x_series':
      case 'lightspeed_retail_x-series(vend)':
      case 'lightspeed_retail_x-series':
        return svgPath('lightspeedx');
      case 'lightspeed_retail_r-series':
        return svgPath('lightspeedr');
      case 'john_lewis_the_edge':
      case 'the_edge_by_john_lewis':
      case 'the_edge':
        return svgPath('edge');
      case 'business_central':
      case 'microsoft_business_central':
        return svgPath('ms_business_central');
      case 'sparklayer':
      case 'spark_layer':
      case 'spark_layer_b2b':
      case 'sparklayer_b2b':
        return svgPath('sparklayer');
      case 'voyado':
        return svgPath('voyado');
      case 'global-e':
        return svgPath('globale');
      case 'inventory_planner':
        return svgPath('inventory_planner');
      case 'active_ants':
        return svgPath('activeants');
      default:
        return LOGOS.includes(filename) ? svgPath(filename) : DEFAULT_IMAGE;
    }
  } catch (error) {
    return DEFAULT_IMAGE;
  }
};

export { getSystemLogo };
