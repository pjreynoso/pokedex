import { useQuery } from '@tanstack/react-query';
import { getPokemonByNameOrId } from '../api/pokemonApi';

export const normalizePokemonSearch = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '');
};

export const usePokemonSearch = (query: string) => {
  const normalized = normalizePokemonSearch(query);

  return useQuery({
    queryKey: ['pokemon', 'search', normalized],
    queryFn: () => getPokemonByNameOrId(normalized),
    enabled: Boolean(normalized),
    retry: false,
    staleTime: 1000 * 60 * 10,
  });
};

export default usePokemonSearch;
