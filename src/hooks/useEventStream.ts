
import { useEffect, useState } from 'react';
import { getToken } from '../auth/auth';

const API_BASE = 'http://localhost:8787';

export function useEventStream(onEvent?: (event: any) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Standard EventSource does not support headers polyfill usually needed for auth.
    // For local dev/demo, we can pass token in query param or rely on cookie (not used here).
    // Alternatively, use a library like `event-source-polyfill` or `fetch` with readable stream.
    // Simpler approach for this prompt: Pass token in query param to bypass header restriction of native EventSource.
    // Server must accept token in query string too.
    
    // NOTE: For this implementation, we will assume standard EventSource works if we hack auth via query param.
    // Need to ensure server middleware checks query param too.
    // Let's rely on native EventSource.
    
    // Modify server middleware? No, let's assume for this prompt we use `event-source-polyfill` pattern 
    // OR just use query param. 
    // I will add query param support to middleware in next prompt if needed, but here I will assume query param works.
    
    // Actually, `server/src/middleware.ts` checks `req.headers.authorization`. 
    // Native EventSource CANNOT send headers. 
    // I will implement a fetch-based reader here to support headers.

    const controller = new AbortController();
    
    const connect = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/stream`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (!response.ok) throw new Error('Failed to connect stream');
        if (!response.body) throw new Error('No body');

        setIsConnected(true);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (onEvent) onEvent(data);
              } catch (e) {
                // ignore json error
              }
            }
          }
        }
      } catch (e) {
        setIsConnected(false);
        // Retry logic could go here
      }
    };

    connect();

    return () => {
      controller.abort();
      setIsConnected(false);
    };
  }, []);

  return isConnected;
}
