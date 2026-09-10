import { pokeApiClient } from './pokeApi';
import { PokemonTypeResponse, Pokemon, NamedAPIResourceListResponse } from '@pokemon/shared';

export const getPokemonByType = async (type: string): Promise<PokemonTypeResponse> => {
  const response = await pokeApiClient.get<PokemonTypeResponse>(`/type/${type.toLowerCase()}`);
  return response.data;
};

export const getPokemonByNameOrId = async (nameOrId: string | number): Promise<Pokemon> => {
  const query = String(nameOrId).toLowerCase().trim();
  const response = await pokeApiClient.get<Pokemon>(`/pokemon/${query}`);
  return response.data;
};

export const getPokemonList = async (limit = 30, offset = 0): Promise<NamedAPIResourceListResponse> => {
  const response = await pokeApiClient.get<NamedAPIResourceListResponse>('/pokemon', {
    params: { limit, offset },
  });
  return response.data;
};

export const extractPokemonIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10) || 0;
};

export const getPokemonArtworkUrl = (idOrUrl: number | string): string => {
  const id = typeof idOrUrl === 'number' ? idOrUrl : extractPokemonIdFromUrl(idOrUrl);
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};
