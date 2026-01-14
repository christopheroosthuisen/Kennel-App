
import { useEffect, useState } from 'react';
import { getToken } from '../auth/auth';

export function useEventStream(onEvent?: (event: any) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const controller = new AbortController();
    
    const connect = async () => {
      try {
        const response = await fetch('/api/stream', {
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
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete data in buffer
          
          for (const line of lines) {
            const dataLine = line.split('\n').find(l => l.startsWith('data: '));
            if (dataLine) {
              try {
                const data = JSON.parse(dataLine.substring(6));
                if (onEvent && data.type !== 'connected') onEvent(data);
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Stream error", e);
          setIsConnected(false);
          // Simple retry
          setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      controller.abort();
      setIsConnected(false);
    };
  }, [onEvent]);

  return isConnected;
}
