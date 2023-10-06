import { mapActions } from 'pinia';
import { traverse } from '@/lib/mapping';

export const schemaHelperMixin = {
  data() {
    return {
      schemaDirections: ['fromSchema', 'toSchema'],
      toSchema: null,
      fromSchema: null,
      toSchemaTree: null,
      fromSchemaTree: null,
    };
  },
  methods: {
    ...mapActions(useMappingTransformationsStore, ['storeSourceSchema']),
    async getSchemas(sourceFactorySystem, destinationFactorySystem) {
      await Promise.allSettled([
        this.getSystemEntitySchema(sourceFactorySystem.id, 'fromSchema'),
        this.getSystemEntitySchema(destinationFactorySystem.id, 'toSchema'),
      ]);
    },
    async getSystemEntitySchema(factorySystemId, schemaType) {
      try {
        const responseData = await this.$axios
          .$get(
            `/api/api/v2/factory-system-schemas?filter[factory_system_id]=${factorySystemId}`
          )
          .then((r) => r.data);
        if (!responseData.length) {
          console.log('No schema found');
          return;
        }
        const integrationSchema = responseData.find(
          (schema) => schema.integration_id !== null
        );
        const globalSchema = responseData.find(
          (schema) => schema.integration_id === null
        );
        const schemaToUse = integrationSchema || globalSchema;
        switch (schemaToUse.type) {
          case 'example':
          case 'json':
            this[schemaType] = JSON.parse(schemaToUse.schema);
            break;
          case 'csv':
            this[schemaType] = schemaToUse.schema
              .split(',')
              .reduce((key, value) => ({ ...key, [value]: value }), {});
            break;

          default:
            break;
        }
        this[schemaType + 'Tree'] = traverse(this[schemaType]);

        if (schemaType === 'fromSchema') {
          this.storeSourceSchema(this.fromSchemaTree);
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
