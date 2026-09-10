export const POKEMON_VISIT_EVENT = 'pokemon:visit' as const;

export interface PokemonVisitDetail {
  name: string;
  image: string;
}

export type PokemonVisitEvent = CustomEvent<PokemonVisitDetail>;
