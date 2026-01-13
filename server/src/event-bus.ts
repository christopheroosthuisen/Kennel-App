
import { ServerResponse } from 'http';

type EventType = 'notification' | 'reservation' | 'report_card' | 'message';

interface SseClient {
  id: string;
  res: ServerResponse;
}

const clients = new Set<SseClient>();

export const eventBus = {
  subscribe: (res: ServerResponse) => {
    const id = Math.random().toString(36).substring(2);
    const client = { id, res };
    clients.add(client);

    // Initial connection header
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Cleanup on close
    res.on('close', () => {
      clients.delete(client);
    });
  },

  publish: (type: EventType, payload: any) => {
    const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    clients.forEach(client => {
      client.res.write(`data: ${data}\n\n`);
    });
  }
};
