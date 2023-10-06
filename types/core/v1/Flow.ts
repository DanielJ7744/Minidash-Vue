export type Flow = {
  id: string;
  trigger: 'manual' | 'schedule' | 'webhook';
  steps: FlowStep[];
};

export type FlowStepShapeType =
  | 'trigger'
  | 'filter'
  | 'branch'
  | 'connector'
  | 'map';

export type FlowStep = {
  id: string;
  parent_id?: FlowStep['id'] | null;
  type: FlowStepShapeType;
  children?: FlowStep[];
};

export const flowShapeMeta: {
  [Property in FlowStepShapeType]: {
    readonly icon: string;
    readonly accent: string;
  };
} = {
  trigger: {
    icon: 'la:rocket',
    accent: 'bg-purple-500',
  },
  filter: {
    icon: 'la:filter',
    accent: 'bg-orange-500',
  },
  branch: {
    icon: 'la:code-branch',
    accent: 'bg-purple-500',
  },
  connector: {
    icon: 'la:cubes',
    accent: 'bg-sky-500',
  },
  map: {
    icon: 'la:random',
    accent: 'bg-yellow-50',
  },
};
