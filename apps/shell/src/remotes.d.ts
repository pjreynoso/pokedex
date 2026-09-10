declare module 'mf_detail/PokemonDetail' {
  import type { ComponentType } from 'react';

  export interface PokemonDetailProps {
    pokemonNameOrId?: string | number | null;
    onClose?: () => void;
  }

  const PokemonDetail: ComponentType<PokemonDetailProps>;
  export default PokemonDetail;
}

declare module 'mf_history/PokemonHistory' {
  import type { ComponentType } from 'react';

  export interface PokemonHistoryProps {
    onSelectPokemon?: (name: string) => void;
  }

  const PokemonHistory: ComponentType<PokemonHistoryProps>;
  export default PokemonHistory;
}
