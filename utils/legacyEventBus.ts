import mitt from 'mitt';

const EventBus = mitt();
const useLegacyEventBus = () => EventBus;

export { useLegacyEventBus };
