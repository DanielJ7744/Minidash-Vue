export const systemsHelperMixin = {
  data() {
    return {
      imageName: null,
    };
  },
  methods: {
    getIconName(systemName) {
      return getSystemLogo(systemName);
    },
    getCredentialFields(system) {
      if (!system) {
        return {};
      }

      const fields = {
        auth_types: [],
        credential_fields: [],
      };
      if (system.system_authorisation_types == null) {
        return fields;
      }

      system.system_authorisation_types.forEach(schema => {
        const obj = {};
        fields.auth_types.push(schema.authorisation_type.name);
        obj.auth_type = schema.authorisation_type.name;
        const credentialSchema = schema.credentials_schema;
        if (
          !credentialSchema ||
          !('attributes' in credentialSchema) ||
          credentialSchema.attributes == null
        ) {
          fields.credential_fields.push(obj);
          return;
        }
        credentialSchema.attributes.forEach(credential => {
          if (credential.type === 'select') {
            if (!('options' in credential)) {
              return;
            }
            obj[credential.value] = credential;
            return;
          }
          obj[credential.value] = credential;
        });

        fields.credential_fields.push(obj);
      });
      return fields;
    },
  },
};
