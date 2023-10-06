const goToNextSetupStep = (endpoint, connectionId, serviceId) => {
  navigateTo({
    name: `connections-connectionId-services-serviceId-${endpoint}`,
    query: {
      path: 'new',
    },
    params: {
      serviceId,
      connectionId,
    },
  });
};

export { goToNextSetupStep };
