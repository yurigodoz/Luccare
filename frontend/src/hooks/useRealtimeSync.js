import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useRealtimeSync(callback, dependentIds) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    socketRef.current = socket;

    socket.on('schedule-updated', () => {
      callbackRef.current();
    });

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
