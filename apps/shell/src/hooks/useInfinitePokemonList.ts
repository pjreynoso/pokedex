import { useInfiniteQuery } from '@tanstack/react-query';
import { getPokemonList } from '../api/pokemonApi';

export const useInfinitePokemonList = () => {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'infinite-list'],
    queryFn: ({ pageParam = 0 }) => getPokemonList(30, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * 30;
      return nextOffset < lastPage.count ? nextOffset : undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export default useInfinitePokemonList;
