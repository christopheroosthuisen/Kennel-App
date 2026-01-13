
import { Handler } from '../router';
import { eventBus } from '../event-bus';

export const streamEvents: Handler = async (req, res) => {
  // Keep connection open
  eventBus.subscribe(res);
};
