import React, { useState, useEffect } from 'react';
import { usePokemonDetail } from './hooks/usePokemonDetail';
import './index.css';

export interface PokemonDetailProps {
  pokemonNameOrId?: string | number | null;
  onClose?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  fire: 'bg-orange-500 text-white',
  water: 'bg-blue-500 text-white',
  grass: 'bg-emerald-600 text-white',
  electric: 'bg-amber-400 text-gray-900',
  poison: 'bg-purple-600 text-white',
  flying: 'bg-indigo-600 text-white',
  bug: 'bg-lime-600 text-white',
  normal: 'bg-slate-500 text-white',
  ground: 'bg-amber-700 text-white',
  fairy: 'bg-pink-500 text-white',
  fighting: 'bg-red-700 text-white',
  psychic: 'bg-pink-600 text-white',
  rock: 'bg-yellow-800 text-white',
  ghost: 'bg-violet-800 text-white',
  ice: 'bg-cyan-400 text-gray-900',
  dragon: 'bg-indigo-700 text-white',
  steel: 'bg-slate-400 text-white',
  dark: 'bg-gray-800 text-white',
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

export const PokemonDetail: React.FC<PokemonDetailProps> = ({
  pokemonNameOrId,
  onClose,
}) => {
  const { pokemon, isLoading, error, refetch } = usePokemonDetail(pokemonNameOrId);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [pokemonNameOrId]);

  if (!pokemonNameOrId) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-200 min-h-[360px] sm:min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center mb-3 shadow-sm">
          <span className="text-2xl select-none" aria-hidden="true">⚡</span>
        </div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          Sin Pokémon seleccionado
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm max-w-xs leading-relaxed">
          Selecciona un Pokémon de la lista o buscador para ver su detalle aquí.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Cargando detalles del Pokémon"
        className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/80 animate-pulse space-y-4 min-h-[360px] sm:min-h-[400px]"
      >
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="w-40 h-40 mx-auto rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-center gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div
        role="alert"
        className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-center"
      >
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
          {error || 'No se pudo cargar la información'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const artwork =
    pokemon.sprites.other?.dream_world?.front_default ||
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '';

  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  return (
    <div className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-200">
      {/* Header with Name, ID & Close */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">
            {formattedId}
          </span>
          <h2 className="text-2xl font-black capitalize text-gray-900 dark:text-white tracking-tight">
            {pokemon.name}
          </h2>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            ✕
          </button>
        )}
      </div>

      {/* Pokemon Image (SVG / transparent artwork) */}
      <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent dark:from-red-500/20 rounded-full blur-xl pointer-events-none" />
        {artwork && !imgError ? (
          <img
            src={artwork}
            alt={pokemon.name}
            onError={() => setImgError(true)}
            className="w-44 h-44 object-contain filter drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-xs text-gray-400 font-medium">Sin imagen disponible</div>
        )}
      </div>

      {/* Type Badges */}
      <div className="flex justify-center gap-2 my-4">
        {pokemon.types.map((typeSlot) => {
          const typeName = typeSlot.type.name;
          const colorClass = TYPE_COLORS[typeName.toLowerCase()] || 'bg-gray-500 text-white';
          return (
            <span
              key={typeName}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${colorClass}`}
            >
              {typeName}
            </span>
          );
        })}
      </div>

      {/* Height & Weight */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-100/90 dark:bg-gray-700/60 border border-gray-200/80 dark:border-gray-700 rounded-xl mb-4 text-center">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Altura</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {(pokemon.height / 10).toFixed(1)} m
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Peso</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {(pokemon.weight / 10).toFixed(1)} kg
          </span>
        </div>
      </div>

      {/* Stats Progress Bars */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Estadísticas Base
        </h3>
        <div className="space-y-1.5">
          {pokemon.stats.map((stat) => {
            const statName = stat.stat.name;
            const label = STAT_LABELS[statName] || statName;
            const value = stat.base_stat;
            const percentage = Math.min(100, Math.round((value / 150) * 100));

            return (
              <div key={statName} className="flex items-center text-xs">
                <span className="w-20 font-medium text-gray-700 dark:text-gray-300 truncate">
                  {label}
                </span>
                <span className="w-8 font-mono font-bold text-gray-900 dark:text-white text-right mr-2">
                  {value}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden min-w-[60px]">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
