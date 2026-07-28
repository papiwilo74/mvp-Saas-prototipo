import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { env } from '../config/env';

export function useSocket(restaurantId, user) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(env.apiUrl?.replace('/api', '') || 'http://localhost:4000', {
      query: { restaurantId: restaurantId || '' },
      withCredentials: true,
      auth: user ? { token: '' } : undefined
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId, user?.id]);

  return { socketRef, connected };
}
