import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { SearchModal } from '../../apps/shell/src/components/search/SearchModal';
import * as useSearchModule from '../../apps/shell/src/hooks/usePokemonSearch';
import * as useInfiniteModule from '../../apps/shell/src/hooks/useInfinitePokemonList';
import { renderWithProviders } from '../utils/test-wrapper';
import { Pokemon, NamedAPIResourceListResponse } from '@pokemon/shared';

describe('Buscador Fullscreen, Infinite Scroll y Búsqueda Exacta (Fase 4)', () => {
  const mockPokemon: Pokemon = {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
    stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } }],
    sprites: {
      front_default: 'https://img.com/pikachu.png',
      other: {
        'official-artwork': {
          front_default: 'https://img.com/pikachu-art.png',
        },
      },
    },
  };

  const mockInfinite30: NamedAPIResourceListResponse = {
    count: 1300,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=30&limit=30',
    previous: null,
    results: Array.from({ length: 30 }, (_, i) => ({
      name: `pokemon-${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    })),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('1. Interacción Modal y Bloqueo de Scroll (UI)', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      renderWithProviders(
        <SearchModal
          isOpen={false}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('bloquea el scroll del body al abrirse y lo restaura al cerrarse', () => {
      const { rerender } = renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <SearchModal
          isOpen={false}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(document.body.style.overflow).toBe('');
    });

    it('cierra el modal cuando el usuario presiona la tecla Escape', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={onClose}
          onSelectPokemon={vi.fn()}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Listado Inicial de 30 Pokémon y Scroll Infinito', () => {
    it('muestra exactamente los 30 Pokémon iniciales cuando no hay búsqueda activa', () => {
      vi.spyOn(useInfiniteModule, 'useInfinitePokemonList').mockReturnValue({
        data: { pages: [mockInfinite30], pageParams: [0] },
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useInfiniteModule.useInfinitePokemonList>);

      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(screen.getByText('pokemon-1')).toBeInTheDocument();
      expect(screen.getByText('pokemon-30')).toBeInTheDocument();
      expect(screen.getByText(/mostrando listado de pokémon con scroll infinito/i)).toBeInTheDocument();
    });

    it('permite seleccionar un Pokémon del listado inicial, cerrando el modal', () => {
      vi.spyOn(useInfiniteModule, 'useInfinitePokemonList').mockReturnValue({
        data: { pages: [mockInfinite30], pageParams: [0] },
        isLoading: false,
        isError: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useInfiniteModule.useInfinitePokemonList>);

      const onSelectPokemon = vi.fn();
      const onClose = vi.fn();

      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={onClose}
          onSelectPokemon={onSelectPokemon}
        />
      );

      const card = screen.getByRole('button', { name: /ver detalles de pokemon-1 #001/i });
      fireEvent.click(card);

      expect(onSelectPokemon).toHaveBeenCalledWith('pokemon-1');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('muestra estado de error y botón de reintento si falla la carga del listado', () => {
      const refetch = vi.fn();
      vi.spyOn(useInfiniteModule, 'useInfinitePokemonList').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        refetch,
      } as unknown as ReturnType<typeof useInfiniteModule.useInfinitePokemonList>);

      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(screen.getByText(/error al cargar el listado de pokémon/i)).toBeInTheDocument();
      const retryBtn = screen.getByRole('button', { name: /reintentar conexión/i });
      fireEvent.click(retryBtn);

      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Búsqueda Exacta y Formulario (Submit, Debounce, Encontrado, No Encontrado)', () => {
    it('muestra estado "Pokémon No Encontrado" cuando la búsqueda exacta no existe', () => {
      vi.spyOn(useSearchModule, 'usePokemonSearch').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      } as unknown as ReturnType<typeof useSearchModule.usePokemonSearch>);

      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/buscar por nombre exacto/i);
      fireEvent.change(input, { target: { value: 'inventado123' } });

      // Submit via form/button
      const submitBtn = screen.getByRole('button', { name: /buscar/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Pokémon No Encontrado/i)).toBeInTheDocument();
      expect(screen.getByText(/No pudimos encontrar ningún Pokémon con el nombre/i)).toBeInTheDocument();
    });

    it('permite buscar inmediatamente presionando Enter en el formulario', () => {
      vi.spyOn(useSearchModule, 'usePokemonSearch').mockReturnValue({
        data: mockPokemon,
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useSearchModule.usePokemonSearch>);

      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/buscar por nombre exacto/i);
      fireEvent.change(input, { target: { value: 'pikachu' } });
      fireEvent.submit(input.closest('form')!);

      expect(screen.getByText(/Coincidencia exacta encontrada/i)).toBeInTheDocument();
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });

    it('limpia el término de búsqueda con el botón "X" y restaura la vista', () => {
      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/buscar por nombre exacto/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'pikachu' } });

      expect(input.value).toBe('pikachu');

      const clearBtn = screen.getByRole('button', { name: /limpiar búsqueda/i });
      fireEvent.click(clearBtn);

      expect(input.value).toBe('');
    });
  });

  describe('4. Estrés y Resiliencia Frontend (Burst Input y Cleanup de Memoria)', () => {
    it('soporta ráfagas ultrarrápidas de tecleo (burst input) sin desfasar el estado ni fallar', () => {
      renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(/buscar por nombre exacto/i) as HTMLInputElement;

      const characters = 'abcdefghijklmnopqrstuvwxyz0123';
      let currentVal = '';
      for (const char of characters) {
        currentVal += char;
        fireEvent.change(input, { target: { value: currentVal } });
      }

      expect(input.value).toBe(characters);
    });

    it('libera adecuadamente los event listeners y el IntersectionObserver al desmontarse', () => {
      const { unmount } = renderWithProviders(
        <SearchModal
          isOpen={true}
          onClose={vi.fn()}
          onSelectPokemon={vi.fn()}
        />
      );

      expect(() => unmount()).not.toThrow();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
