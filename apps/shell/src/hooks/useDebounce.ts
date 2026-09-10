import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a rapidly changing value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds (default: 350ms).
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
