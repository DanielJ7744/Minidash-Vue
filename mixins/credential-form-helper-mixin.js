export const credentialFormHelperMixin = {
  methods: {
    performSuccessResponseActions(redirectUrl) {
      this.$notify(
        {
          group: 'notifications',
          type: 'success',
          text: 'Credentials saved successfully',
        },
        4000
      );
      navigateTo(redirectUrl);
      this.isMakingRequest = false;
    },
    performFailResponseActions(e) {
      this.$notify(
        {
          group: 'notifications',
          type: 'error',
          text: `There has been an error whilst saving the credentials: ${e}`,
        },
        4000
      );
      this.isMakingRequest = false;
      this.hasErrors = true;
      this.errors = e.response.data.errors;
    },
    async sendPostRequest(data, submitUrl) {
      await this.$axios.post(submitUrl, data);
    },
    async sendPatchRequest(data, submitUrl) {
      await this.$axios.patch(`${submitUrl}/${data.id}`, data);
    },
    fieldIsMasked(value) {
      if (typeof value !== 'string') {
        return false;
      }

      return !value ? false : value.match(/[^*]/) === null;
    },
    getPlaceHolder(value, placeholder) {
      return this.fieldIsMasked(value) ? value : placeholder;
    },
    removeMaskedAttributeData(formDataToCheck) {
      const newData = {};
      for (const [key, value] of Object.entries(formDataToCheck)) {
        if (!this.fieldIsMasked(value)) {
          newData[key] = value;
        }
      }
      return newData;
    },
  },
};
