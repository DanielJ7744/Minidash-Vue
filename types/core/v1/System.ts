import { Connector } from './Connector';

export type System = {
  id: number;
  name: string;
  connectors?: Connector[];
};
