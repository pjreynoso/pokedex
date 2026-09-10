export interface PokemonTypeRef {
  name: string;
  url: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: PokemonTypeRef;
}

export interface PokemonStatRef {
  name: string;
  url: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: PokemonStatRef;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny?: string | null;
  other?: {
    dream_world?: {
      front_default: string | null;
    };
    'official-artwork'?: {
      front_default: string | null;
    };
    home?: {
      front_default: string | null;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface NamedAPIResourceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonTypeResponse {
  id: number;
  name: string;
  pokemon: {
    slot: number;
    pokemon: NamedAPIResource;
  }[];
}
