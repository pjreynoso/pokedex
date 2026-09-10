import React, { useState } from 'react';
import { extractPokemonIdFromUrl, getPokemonArtworkUrl } from '../../api/pokemonApi';

export interface PokemonCardProps {
  name: string;
  url?: string;
  id?: number;
  onClick?: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ name, url, id, onClick }) => {
  const pokemonId = id ?? (url ? extractPokemonIdFromUrl(url) : 0);
  const imageUrl = getPokemonArtworkUrl(pokemonId);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedId = pokemonId > 0 ? `#${String(pokemonId).padStart(3, '0')}` : '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col items-center p-4 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500"
      aria-label={`Ver detalles de ${name} ${formattedId}`}
    >
      {formattedId && (
        <span className="absolute top-2 right-2 text-xs font-mono font-semibold text-gray-400 dark:text-gray-500">
          {formattedId}
        </span>
      )}

      <div className="w-24 h-24 relative flex items-center justify-center mb-3">
        {!imageLoaded && !imageError && (
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        )}
        {imageError ? (
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-gray-500">
            Sin imagen
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-24 h-24 object-contain transition-transform duration-200 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          />
        )}
      </div>

      <h3 className="text-sm font-bold capitalize text-gray-900 dark:text-white text-center group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate w-full">
        {name}
      </h3>
    </div>
  );
};

export default PokemonCard;
