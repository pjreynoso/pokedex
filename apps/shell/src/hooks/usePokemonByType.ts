import { useQuery } from '@tanstack/react-query';
import { getPokemonByType } from '../api/pokemonApi';

export const usePokemonByType = (type: string) => {
  return useQuery({
    queryKey: ['pokemon', 'type', type],
    queryFn: () => getPokemonByType(type),
    enabled: Boolean(type),
    staleTime: 1000 * 60 * 10,
  });
};

export default usePokemonByType;
