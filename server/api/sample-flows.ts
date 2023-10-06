/*
❗️ Temporary API route to mock a flow from the API
*/
import type { Flow } from '@/types/core/v1';

export default defineEventHandler((event) => {
  const { complexity } = getQuery(event);

  const flow: string =
    complexity && !!flows[complexity as string]
      ? (complexity as string)
      : 'simple';

  return { data: flows[flow] };
});

const simple: Flow = {
  id: '1',
  trigger: 'schedule',
  steps: [
    {
      id: '1',
      parent_id: null,
      type: 'trigger',
    },
    {
      id: '2',
      parent_id: '1',
      type: 'connector',
    },
    {
      id: '3',
      parent_id: '2',
      type: 'filter',
    },
    {
      id: '4',
      parent_id: '3',
      type: 'map',
    },
    {
      id: '5',
      parent_id: '4',
      type: 'connector',
    },
  ],
};

const intermediate: Flow = {
  id: '1',
  trigger: 'schedule',
  steps: [
    {
      id: '1',
      parent_id: null,
      type: 'trigger',
    },
    {
      id: '2',
      parent_id: '1',
      type: 'connector',
    },
    {
      id: '3',
      parent_id: '2',
      type: 'branch',
    },
    {
      id: '4',
      parent_id: '3',
      type: 'filter',
    },
    {
      id: '5',
      parent_id: '3',
      type: 'filter',
    },
    {
      id: '6',
      parent_id: '5',
      type: 'map',
    },
    {
      id: '7',
      parent_id: '4',
      type: 'map',
    },
    {
      id: '8',
      parent_id: '6',
      type: 'connector',
    },
    {
      id: '9',
      parent_id: '7',
      type: 'connector',
    },
  ],
};

const advanced: Flow = {
  id: '1',
  trigger: 'schedule',
  steps: [
    {
      id: '1',
      parent_id: null,
      type: 'trigger',
    },
    {
      id: '2',
      parent_id: '1',
      type: 'connector',
    },
    {
      id: '3',
      parent_id: '2',
      type: 'branch',
    },
    {
      id: '4',
      parent_id: '3',
      type: 'filter',
    },
    {
      id: '5',
      parent_id: '3',
      type: 'filter',
    },
    {
      id: '6',
      parent_id: '5',
      type: 'map',
    },
    {
      id: '7',
      parent_id: '4',
      type: 'map',
    },
    {
      id: '8',
      parent_id: '6',
      type: 'branch',
    },
    {
      id: '9',
      parent_id: '7',
      type: 'branch',
    },
    {
      id: '10',
      parent_id: '7',
      type: 'map',
    },
    {
      id: '11',
      parent_id: '9',
      type: 'filter',
    },
    {
      id: '12',
      parent_id: '11',
      type: 'map',
    },
    {
      id: '13',
      parent_id: '8',
      type: 'filter',
    },
    {
      id: '14',
      parent_id: '13',
      type: 'connector',
    },
    {
      id: '15',
      parent_id: '8',
      type: 'map',
    },
    {
      id: '16',
      parent_id: '15',
      type: 'filter',
    },
    {
      id: '17',
      parent_id: '16',
      type: 'connector',
    },
    {
      id: '18',
      parent_id: '12',
      type: 'branch',
    },
    {
      id: '19',
      parent_id: '18',
      type: 'map',
    },

    {
      id: '21',
      parent_id: '19',
      type: 'connector',
    },
    {
      id: '22',
      parent_id: '10',
      type: 'filter',
    },
    {
      id: '23',
      parent_id: '22',
      type: 'branch',
    },
    {
      id: '24',
      parent_id: '23',
      type: 'filter',
    },
    {
      id: '25',
      parent_id: '24',
      type: 'connector',
    },
    {
      id: '26',
      parent_id: '8',
      type: 'map',
    },
    {
      id: '27',
      parent_id: '26',
      type: 'filter',
    },
    {
      id: '28',
      parent_id: '27',
      type: 'connector',
    },
    //
    {
      id: '29',
      parent_id: '9',
      type: 'map',
    },
    {
      id: '30',
      parent_id: '29',
      type: 'filter',
    },
    {
      id: '31',
      parent_id: '30',
      type: 'connector',
    },
    //
    {
      id: '32',
      parent_id: '23',
      type: 'map',
    },
    {
      id: '33',
      parent_id: '32',
      type: 'filter',
    },
    {
      id: '34',
      parent_id: '33',
      type: 'connector',
    },
    //
    {
      id: '35',
      parent_id: '18',
      type: 'map',
    },
    {
      id: '36',
      parent_id: '35',
      type: 'filter',
    },
    {
      id: '37',
      parent_id: '36',
      type: 'connector',
    },
  ],
};

const flows: { [key: string]: Flow } = {
  simple,
  intermediate,
  advanced,
};
