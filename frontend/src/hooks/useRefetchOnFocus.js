import { useEffect, useRef } from 'react';

export function useRefetchOnFocus(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = () => callbackRef.current();
    window.addEventListener('focus', handler);
    window.addEventListener('online', handler);
    return () => {
      window.removeEventListener('focus', handler);
      window.removeEventListener('online', handler);
    };
  }, []);
}
