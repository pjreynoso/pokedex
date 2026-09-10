import { useState, useEffect, useRef, useCallback } from 'react';
import { Pokemon, POKEMON_VISIT_EVENT } from '@pokemon/shared';

export interface UsePokemonDetailResult {
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to decouple and encapsulate data fetching and visit events for Pokemon details.
 * @param pokemonNameOrId The name or numerical ID of the Pokemon to load.
 */
export const usePokemonDetail = (
  pokemonNameOrId?: string | number | null
): UsePokemonDetailResult => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastDispatchedRef = useRef<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!pokemonNameOrId) {
      setPokemon(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const cleanQuery = String(pokemonNameOrId).toLowerCase().trim();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanQuery}`);
      if (!res.ok) {
        throw new Error(`No se encontró el Pokémon "${cleanQuery}" (Status: ${res.status})`);
      }
      const data: Pokemon = await res.json();

      setPokemon(data);
      setIsLoading(false);

      // Emit visit event once per opened pokemon (Task 5.5)
      const primaryImage =
        data.sprites?.other?.dream_world?.front_default ||
        data.sprites?.other?.['official-artwork']?.front_default ||
        data.sprites?.front_default ||
        '';

      if (lastDispatchedRef.current !== data.name) {
        lastDispatchedRef.current = data.name;
        const visitEvent = new CustomEvent(POKEMON_VISIT_EVENT, {
          detail: {
            name: data.name,
            image: primaryImage,
          },
          bubbles: true,
        });
        window.dispatchEvent(visitEvent);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del Pokémon');
      setIsLoading(false);
    }
  }, [pokemonNameOrId]);

  useEffect(() => {
    if (!pokemonNameOrId) {
      setPokemon(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchDetail();
  }, [pokemonNameOrId, fetchDetail]);

  return {
    pokemon,
    isLoading,
    error,
    refetch: fetchDetail,
  };
};

export default usePokemonDetail;
