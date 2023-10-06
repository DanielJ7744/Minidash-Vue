const showError = (toast, error, duration = 5000) => {
  if (error?.response?.data?.errors?.[0]?.detail) {
    toast({ group: 'notifications', type: 'error', text: error.response.data.errors[0].detail }, duration)
  } else if (error?.response?.data?.message) {
    toast({ group: 'notifications', type: 'error', text: error?.response?.data?.message }, duration)
  }
}

export {
  showError
}
