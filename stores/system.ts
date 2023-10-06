import { defineStore } from 'pinia';

import type {
  System,
  SystemType,
  Integration,
  Connector,
} from '~~/types/fabric/v2';
import type { PaginatedResponse } from '~~/types/Laravel';

export const useSystemStore = defineStore('system', {
  state: (): {
    systems: System[];
    systemTypes: SystemType[];
    companyIntegrations: Integration[];
    credentials: Connector[];
  } => {
    return {
      systems: [],
      systemTypes: [],
      companyIntegrations: [],
      credentials: [],
    };
  },

  actions: {
    async loadSystems() {
      if (this.systems.length) {
        return;
      }

      const { data: systems } = await useFabric<{ data: System[] }>(
        '/api/v2/systems'
      );

      this.systems = systems;
    },
    async loadSystemTypes() {
      const response = await useFabric<{ data: SystemType[] }>(
        '/api/v2/system-types'
      );

      this.systemTypes = response.data;

      return response;
    },

    async loadCompanyIntegrations(options: {
      force_reload: boolean;
      page_number: number;
    }) {
      if (this.companyIntegrations.length && !options.force_reload) {
        return;
      }

      const response = await useFabric<PaginatedResponse<System>>(
        '/api/v2/integrations',
        { params: { page: options.page_number } }
      );

      this.companyIntegrations = this.companyIntegrations.concat(response.data);
      if (response.links.next) {
        options.page_number++;

        await this.loadCompanyIntegrations(options);
      }
    },
    async loadCredentials() {
      const response = await useFabric<{ data: Connector[] }>(
        '/api/v2/connectors'
      );
      response.data = response.data.filter(
        (connector) => connector !== null && Object.keys(connector).length !== 0
      );

      this.credentials = response.data;

      return response;
    },

    loadCredentialsByCredentialId(credentialsId: Connector['id']) {
      return useFabric<{ data: Connector }>(
        `/api/v2/connectors/${credentialsId}`
      );
    },

    deleteCredentialsById(credentialsId: Connector['id']) {
      useFabric(`/api/v2/connectors/${credentialsId}`, {
        method: 'DELETE',
      });
    },
  },
});
