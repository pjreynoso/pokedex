import React, { useMemo } from 'react';
import { usePokemonByType } from '../../hooks/usePokemonByType';
import { PokemonCard } from './PokemonCard';
import { PokemonCardSkeleton } from './PokemonCardSkeleton';
import { Flame, Droplets, Leaf, Zap, HelpCircle, RefreshCw } from 'lucide-react';

export interface CategorySectionProps {
  type: string;
  onSelectPokemon?: (name: string) => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  fire: {
    label: 'Fuego (Fire)',
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    badgeClass: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  water: {
    label: 'Agua (Water)',
    icon: <Droplets className="w-4 h-4 text-blue-500" />,
    badgeClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  grass: {
    label: 'Planta (Grass)',
    icon: <Leaf className="w-4 h-4 text-emerald-500" />,
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  electric: {
    label: 'Eléctrico (Electric)',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    badgeClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
};

export const CategorySection: React.FC<CategorySectionProps> = ({ type, onSelectPokemon }) => {
  const { data, isLoading, isError, refetch } = usePokemonByType(type);

  const config = TYPE_CONFIG[type.toLowerCase()] || {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: <HelpCircle className="w-4 h-4 text-gray-500" />,
    badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  const pokemonList = useMemo(() => {
    return data?.pokemon ? data.pokemon.slice(0, 10) : [];
  }, [data?.pokemon]);

  return (
    <section className="space-y-4" aria-labelledby={`category-title-${type}`}>
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            (10 destacados)
          </span>
        </div>
      </div>

      {/* Loading state: 10 skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <PokemonCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            No se pudieron cargar los Pokémon de tipo {type}.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* Loaded state: exactly 10 pokemon cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {pokemonList.map((entry) => (
            <PokemonCard
              key={entry.pokemon.name}
              name={entry.pokemon.name}
              url={entry.pokemon.url}
              onClick={() => onSelectPokemon?.(entry.pokemon.name)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
