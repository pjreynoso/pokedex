import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { CategorySection } from '../../apps/shell/src/components/pokemon/CategorySection';
import * as usePokemonByTypeModule from '../../apps/shell/src/hooks/usePokemonByType';
import { renderWithProviders } from '../utils/test-wrapper';
import { PokemonTypeResponse } from '@pokemon/shared';

describe('Categorías en Home y Límite de 10 Pokémon (Fase 3)', () => {
  const mockPokemonList = Array.from({ length: 25 }, (_, i) => ({
    slot: i + 1,
    pokemon: {
      name: `fire-pokemon-${i + 1}`,
      url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
    },
  }));

  const mockTypeResponse: PokemonTypeResponse = {
    id: 10,
    name: 'fire',
    pokemon: mockPokemonList,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra estado de carga con exactamente 10 skeletons mientras se obtienen los datos', () => {
    vi.spyOn(usePokemonByTypeModule, 'usePokemonByType').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePokemonByTypeModule.usePokemonByType>);

    renderWithProviders(<CategorySection type="fire" />);

    const skeletons = screen.getAllByRole('status', { name: /cargando pokémon/i });
    expect(skeletons).toHaveLength(10);
  });

  it('muestra estado de error y botón de reintentar si la llamada a PokeAPI falla', () => {
    const mockRefetch = vi.fn();
    vi.spyOn(usePokemonByTypeModule, 'usePokemonByType').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof usePokemonByTypeModule.usePokemonByType>);

    renderWithProviders(<CategorySection type="fire" />);

    expect(screen.getByText(/no se pudieron cargar los pokémon de tipo fire/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('limita estrictamente a exactamente 10 Pokémon el renderizado por categoría', () => {
    vi.spyOn(usePokemonByTypeModule, 'usePokemonByType').mockReturnValue({
      data: mockTypeResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePokemonByTypeModule.usePokemonByType>);

    renderWithProviders(<CategorySection type="fire" />);

    // Total elements in mock is 25, but should only render 10
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(10);
    expect(screen.getByText('fire-pokemon-1')).toBeInTheDocument();
    expect(screen.getByText('fire-pokemon-10')).toBeInTheDocument();
    expect(screen.queryByText('fire-pokemon-11')).not.toBeInTheDocument();
  });

  it('ejecuta el callback onSelectPokemon al hacer clic en una tarjeta de la categoría', () => {
    const onSelectPokemon = vi.fn();
    vi.spyOn(usePokemonByTypeModule, 'usePokemonByType').mockReturnValue({
      data: mockTypeResponse,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePokemonByTypeModule.usePokemonByType>);

    renderWithProviders(
      <CategorySection type="fire" onSelectPokemon={onSelectPokemon} />
    );

    const firstPokemonCard = screen.getByRole('button', { name: /ver detalles de fire-pokemon-1 #001/i });
    fireEvent.click(firstPokemonCard);

    expect(onSelectPokemon).toHaveBeenCalledWith('fire-pokemon-1');
  });
});
