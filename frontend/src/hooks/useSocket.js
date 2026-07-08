import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { env } from '../config/env';

export function useSocket(restaurantId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(env.apiUrl?.replace('/api', '') || 'http://localhost:4000', {
      query: { restaurantId: restaurantId || '' },
      withCredentials: true
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  return { socket: socketRef.current, connected };
}
