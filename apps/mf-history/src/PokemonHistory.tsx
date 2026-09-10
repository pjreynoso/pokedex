import React, { useState, useEffect, useCallback } from 'react';
import {
  VisitedPokemon,
  POKEMON_VISIT_EVENT,
  PokemonVisitDetail,
  STORAGE_KEYS,
} from '@pokemon/shared';

export interface PokemonHistoryProps {
  onSelectPokemon?: (name: string) => void;
}

export const calculateUpdatedHistory = (
  prevHistory: VisitedPokemon[],
  detail: PokemonVisitDetail
): VisitedPokemon[] => {
  const existingIndex = prevHistory.findIndex(
    (item) => item.name.toLowerCase() === detail.name.toLowerCase()
  );

  if (existingIndex >= 0) {
    const existing = prevHistory[existingIndex];
    const updatedItem: VisitedPokemon = {
      ...existing,
      image: detail.image || existing.image,
      visits: existing.visits + 1,
    };
    return [
      updatedItem,
      ...prevHistory.filter((_, idx) => idx !== existingIndex),
    ];
  }

  const newItem: VisitedPokemon = {
    name: detail.name,
    image: detail.image || '',
    visits: 1,
  };
  return [newItem, ...prevHistory];
};

const getStoredHistory = (): VisitedPokemon[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[PokemonHistory] Error reading localStorage:', err);
  }
  return [];
};

export const PokemonHistory: React.FC<PokemonHistoryProps> = ({ onSelectPokemon }) => {
  const [history, setHistory] = useState<VisitedPokemon[]>(() => getStoredHistory());

  const handleNewVisit = useCallback((detail: PokemonVisitDetail) => {
    if (!detail || !detail.name) return;

    // Pure functional state update for React (zero side effects in updater callback)
    setHistory((prevHistory) => calculateUpdatedHistory(prevHistory, detail));

    // Persist synchronously in event handler context
    try {
      const currentStored = getStoredHistory();
      const updatedList = calculateUpdatedHistory(currentStored, detail);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedList));
      localStorage.setItem(
        STORAGE_KEYS.LAST_VISITED,
        JSON.stringify({
          name: detail.name,
          image: detail.image || '',
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('[PokemonHistory] Error writing to localStorage:', err);
    }
  }, []);

  // Listen for real-time events (POKEMON_VISIT_EVENT and storage event for cross-tab sync)
  useEffect(() => {
    const handleCustomVisit = (e: Event) => {
      const customEvent = e as CustomEvent<PokemonVisitDetail>;
      if (customEvent.detail) {
        handleNewVisit(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.HISTORY) {
        setHistory(getStoredHistory());
      }
    };

    window.addEventListener(POKEMON_VISIT_EVENT, handleCustomVisit);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(POKEMON_VISIT_EVENT, handleCustomVisit);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleNewVisit]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (err) {
      console.error('[PokemonHistory] Error clearing history:', err);
    }
    setHistory([]);
  };

  const totalVisits = history.reduce((acc, item) => acc + item.visits, 0);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/80 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Historial de Visitas
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {history.length} Pokémon visitados ({totalVisits} visitas totales)
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-xs font-semibold text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-2xl text-gray-400">
            🕒
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Sin visitas registradas
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
            Abre el detalle de cualquier Pokémon desde el Home o el Buscador para comenzar a registrar tu historial.
          </p>
        </div>
      ) : (
        <div className="mt-4 max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
          {history.map((item) => (
            <div
              key={item.name}
              role={onSelectPokemon ? 'button' : undefined}
              tabIndex={onSelectPokemon ? 0 : undefined}
              onClick={() => onSelectPokemon?.(item.name)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onSelectPokemon) {
                  e.preventDefault();
                  onSelectPokemon(item.name);
                }
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-all ${
                onSelectPokemon ? 'cursor-pointer hover:border-green-500/40' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 flex items-center justify-center shadow-xs">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">?</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold capitalize text-gray-900 dark:text-white">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    Última visita reciente
                  </span>
                </div>
              </div>

              {/* Visits Counter Badge */}
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                  {item.visits} {item.visits === 1 ? 'visita' : 'visitas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonHistory;
