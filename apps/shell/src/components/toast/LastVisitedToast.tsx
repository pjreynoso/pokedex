import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { POKEMON_VISIT_EVENT, PokemonVisitDetail, STORAGE_KEYS } from '@pokemon/shared';

const LAST_VISITED_KEY = STORAGE_KEYS.LAST_VISITED;
const TOAST_DISMISSED_KEY = STORAGE_KEYS.TOAST_DISMISSED;

export interface LastVisitedRecord {
  name: string;
  image: string;
  timestamp: number;
}

export const LastVisitedToast: React.FC = () => {
  const [lastVisited, setLastVisited] = useState<LastVisitedRecord | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { setSelectedPokemon } = useUIStore();

  const checkAndDisplayToast = () => {
    try {
      const rawVisited = localStorage.getItem(LAST_VISITED_KEY);
      if (!rawVisited) {
        setIsVisible(false);
        return;
      }

      const visited: LastVisitedRecord = JSON.parse(rawVisited);
      if (!visited || !visited.name) {
        setIsVisible(false);
        return;
      }

      const rawDismissed = localStorage.getItem(TOAST_DISMISSED_KEY);
      if (rawDismissed) {
        const dismissed = JSON.parse(rawDismissed);
        // If the dismissed timestamp is >= the visited timestamp, don't show
        if (dismissed.timestamp && dismissed.timestamp >= visited.timestamp) {
          setIsVisible(false);
          return;
        }
      }

      setLastVisited(visited);
      setIsVisible(true);
    } catch (err) {
      console.error('[LastVisitedToast] Error checking toast state:', err);
      setIsVisible(false);
    }
  };

  useEffect(() => {
    // Check on initial load/reload
    checkAndDisplayToast();

    // Also update when a visit occurs during runtime
    const handleNewVisit = (e: Event) => {
      const detail = (e as CustomEvent<PokemonVisitDetail>).detail;
      if (detail && detail.name) {
        const record: LastVisitedRecord = {
          name: detail.name,
          image: detail.image || '',
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(record));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(POKEMON_VISIT_EVENT, handleNewVisit);
    return () => window.removeEventListener(POKEMON_VISIT_EVENT, handleNewVisit);
  }, []);

  const handleDismiss = () => {
    if (lastVisited) {
      try {
        localStorage.setItem(
          TOAST_DISMISSED_KEY,
          JSON.stringify({ timestamp: lastVisited.timestamp })
        );
      } catch (err) {
        console.error('[LastVisitedToast] Error saving dismissed state:', err);
      }
    }
    setIsVisible(false);
  };

  const handleOpenDetail = () => {
    if (lastVisited) {
      setSelectedPokemon(lastVisited.name);
      handleDismiss();
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const detailEl = document.getElementById('mf-detail-section');
        detailEl?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isVisible || !lastVisited) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 flex items-center space-x-3 transition-all animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 p-1 flex-shrink-0 flex items-center justify-center">
        {lastVisited.image ? (
          <img
            src={lastVisited.image}
            alt={lastVisited.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <Sparkles className="w-6 h-6 text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block">
          Último Pokémon visitado
        </span>
        <h4 className="text-sm font-bold capitalize text-gray-900 dark:text-white truncate">
          {lastVisited.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={handleOpenDetail}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver detalle
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar notificación de último Pokémon"
        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LastVisitedToast;
