/**
 * Attempt to find a matching service template or create one
 *
 * @param {Object} http An Axios instance
 * @param {Object} pullFactorySystem The source factory system
 * @param {Object} pushFactorySystem The destination factory system
 * @param {Object} integration The integration the service is being created under
 * @returns {Promise<*>}
 */
const findOrCreateServiceTemplate = async (
  http,
  pullFactorySystem,
  pushFactorySystem,
  integration
) => {
  try {
    // this should bring back two, one, or none due to unique constraints
    const existingTemplates = await http
      .$get('/api/api/v2/service-templates', {
        params: {
          'filter[source_factory_system_id]': pullFactorySystem.id,
          'filter[destination_factory_system_id]': pushFactorySystem.id,
          include: 'serviceTemplateOptions',
        },
      })
      .then((r) => r.data);
    if (!existingTemplates.length) {
      return createServiceTemplate(
        http,
        pullFactorySystem,
        pushFactorySystem,
        integration
      );
    }

    // prioritise the global template because that is an override
    const globalTemplate = existingTemplates.filter(
      (existingTemplate) => existingTemplate.integration_id === null
    );
    const integrationTemplate = existingTemplates.filter(
      (existingTemplate) => existingTemplate.integration_id === integration.id
    );

    if (!globalTemplate.length && !integrationTemplate.length) {
      return createServiceTemplate(
        http,
        pullFactorySystem,
        pushFactorySystem,
        integration
      );
    }

    return {
      data: globalTemplate.length ? globalTemplate[0] : integrationTemplate[0],
    };
  } catch (error) {
    return createServiceTemplate(
      http,
      pullFactorySystem,
      pushFactorySystem,
      integration
    );
  }
};

/**
 * Create a service template
 *
 * @param {Object} http An Axios instance
 * @param {Object} pullFactorySystem The source factory system
 * @param {Object} pushFactorySystem The destination factory system
 * @param {Object} integration The integration the service is being created under
 * @returns {Promise<any>}
 */
const createServiceTemplate = (
  http,
  pullFactorySystem,
  pushFactorySystem,
  integration
) => {
  const serviceTemplatePayload = {
    name: `${pullFactorySystem.entity.name} - ${pushFactorySystem.entity.name}`,
    source_factory_system_id: pullFactorySystem.id,
    destination_factory_system_id: pushFactorySystem.id,
    integration_id: integration.id,
  };
  return http.$post('/api/api/v2/service-templates', serviceTemplatePayload);
};

export { findOrCreateServiceTemplate };
