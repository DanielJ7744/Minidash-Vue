const stopService = (http, serviceId, serviceLogId = null) => {
  const payload = {
    type: 'stop_service',
  };

  if (serviceLogId) {
    payload.service_log_id = serviceLogId;
  }

  return http.$post(`/api/api/v2/services/${serviceId}/runtime-flags`, payload);
};

export { stopService };
