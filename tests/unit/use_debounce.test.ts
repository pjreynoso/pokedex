import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../apps/shell/src/hooks/useDebounce';

describe('useDebounce (Hook Aislado de Debouncing)', () => {
  it('retorna el valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('pikachu', 350));
    expect(result.current).toBe('pikachu');
  });

  it('retrasa la actualización del valor hasta que transcurra el tiempo configurado', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'p', delay: 350 },
    });

    expect(result.current).toBe('p');

    // Cambiar el valor rápidamente
    rerender({ value: 'pikachu', delay: 350 });

    // Inmediatamente después, el valor aún no debe haber cambiado
    expect(result.current).toBe('p');

    // Avanzar 200ms (menos que el delay)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('p');

    // Completar el tiempo restante
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('pikachu');

    vi.useRealTimers();
  });
});
