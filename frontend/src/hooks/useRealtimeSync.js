import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useRealtimeSync(callback, dependentIds, extraListeners = {}) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const extraListenersRef = useRef(extraListeners);
  extraListenersRef.current = extraListeners;

  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: token ? { token: `Bearer ${token}` } : undefined,
    });
    socketRef.current = socket;

    socket.on('schedule-updated', () => {
      callbackRef.current();
    });

    for (const [event, handler] of Object.entries(extraListenersRef.current)) {
      socket.on(event, (data) => handler(data));
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !dependentIds || dependentIds.length === 0) return;
    for (const id of dependentIds) {
      socketRef.current.emit('join-dependent', id);
    }
  }, [dependentIds]);
}
