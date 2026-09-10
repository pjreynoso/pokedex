import { create } from 'zustand';

export interface UIState {
  isSearchOpen: boolean;
  selectedPokemon: string | null;
  openSearch: () => void;
  closeSearch: () => void;
  setSelectedPokemon: (name: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  selectedPokemon: 'charizard',
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSelectedPokemon: (name) => set({ selectedPokemon: name }),
}));

export default useUIStore;
