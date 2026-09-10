import React from 'react';

export const PokemonCardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Cargando Pokémon"
      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 shadow-sm flex flex-col items-center animate-pulse"
    >
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
};

export default PokemonCardSkeleton;
