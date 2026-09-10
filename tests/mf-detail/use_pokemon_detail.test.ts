import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePokemonDetail } from '../../apps/mf-detail/src/hooks/usePokemonDetail';
import { POKEMON_VISIT_EVENT } from '@pokemon/shared';

describe('usePokemonDetail (Hook Aislado de Detalle de Pokémon)', () => {
  const mockPikachu = {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: [{ slot: 1, type: { name: 'electric' } }],
    stats: [{ base_stat: 35, stat: { name: 'hp' } }],
    sprites: {
      front_default: 'https://img.com/pikachu.png',
      other: {
        'official-artwork': {
          front_default: 'https://img.com/pikachu-art.png',
        },
      },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna estado inactivo si pokemonNameOrId es nulo o indefinido', () => {
    const { result } = renderHook(() => usePokemonDetail(null));

    expect(result.current.pokemon).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('obtiene los datos del Pokémon y emite el evento de visita', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPikachu,
    } as Response);

    const eventListener = vi.fn();
    window.addEventListener(POKEMON_VISIT_EVENT, eventListener);

    const { result } = renderHook(() => usePokemonDetail('pikachu'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.pokemon).toEqual(mockPikachu);
    });

    expect(eventListener).toHaveBeenCalledTimes(1);
    const event = eventListener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      name: 'pikachu',
      image: 'https://img.com/pikachu-art.png',
    });

    window.removeEventListener(POKEMON_VISIT_EVENT, eventListener);
  });

  it('captura errores de red o HTTP y permite reintentar con refetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPikachu,
      } as Response);

    const { result } = renderHook(() => usePokemonDetail('desconocido'));

    await waitFor(() => {
      expect(result.current.error).toContain('No se encontró el Pokémon');
    });

    // Ejecutar refetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.pokemon).toEqual(mockPikachu);
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
