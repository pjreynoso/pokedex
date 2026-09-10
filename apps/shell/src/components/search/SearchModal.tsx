import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertCircle, Loader2 } from 'lucide-react';
import { useInfinitePokemonList } from '../../hooks/useInfinitePokemonList';
import { usePokemonSearch, normalizePokemonSearch } from '../../hooks/usePokemonSearch';
import { useDebounce } from '../../hooks/useDebounce';
import { PokemonCard, PokemonCardSkeleton } from '../pokemon';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (name: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPokemon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search input by 350ms to prevent request flooding and flashing 404s
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Active query is either the explicitly submitted query or the debounced query
  const effectiveQuery = submittedTerm !== null ? submittedTerm : debouncedSearchTerm;
  const normalizedQuery = normalizePokemonSearch(effectiveQuery);

  // Exact search query (only active if normalizedQuery has at least 1 character)
  const {
    data: exactPokemon,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = usePokemonSearch(normalizedQuery);

  // Infinite list query (initial 30, then 30 more)
  const {
    data: infiniteData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePokemonList();

  // Focus trap, focus restoration & body scroll lock (WCAG 2.2 a11y)
  useEffect(() => {
    if (isOpen) {
      const previouslyFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => inputRef.current?.focus(), 50);

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusable = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      window.addEventListener('keydown', handleTabKey);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = '';
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
          previouslyFocused.focus();
        }
      };
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
      setSubmittedTerm(null);
    }
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!isOpen || normalizedQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isOpen, normalizedQuery, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isOpen) return null;

  const handleSelect = (name: string) => {
    onSelectPokemon(name);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSubmittedTerm(searchTerm);
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Buscador de Pokémon en pantalla completa"
      className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl flex flex-col transition-colors duration-200"
    >
      {/* Top Header & Search Bar */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping inline-block" />
            Buscador PokeAPI
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador (Esc)"
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            aria-label="Buscar Pokémon por nombre exacto o ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSubmittedTerm(null);
            }}
            placeholder="Buscar por nombre exacto (ej. pikachu, bulbasaur, mew)..."
            className="w-full pl-12 pr-28 py-3.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center space-x-1.5">
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSubmittedTerm(null);
                }}
                aria-label="Limpiar búsqueda"
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 px-1">
          <span>
            {normalizedQuery
              ? `Buscando coincidencias para "${normalizedQuery}"`
              : 'Mostrando listado de Pokémon con scroll infinito (+30)'}
          </span>
          <span className="hidden sm:inline">Presiona ENTER para buscar o ESC para cerrar</span>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 sm:p-6 pt-2">
        {/* EXACT SEARCH RESULT */}
        {normalizedQuery ? (
          <div>
            {isSearchLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Buscando a "{normalizedQuery}" en PokeAPI...
                </p>
              </div>
            )}

            {isSearchError && (
              <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Pokémon No Encontrado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  No pudimos encontrar ningún Pokémon con el nombre "{normalizedQuery}". Verifica la ortografía e inténtalo nuevamente.
                </p>
              </div>
            )}

            {exactPokemon && !isSearchLoading && !isSearchError && (
              <div className="max-w-xs mx-auto py-8">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3 text-center uppercase tracking-wider">
                  ✓ Coincidencia exacta encontrada
                </p>
                <PokemonCard
                  name={exactPokemon.name}
                  id={exactPokemon.id}
                  onClick={() => handleSelect(exactPokemon.name)}
                />
              </div>
            )}
          </div>
        ) : (
          /* INFINITE LIST RESULT */
          <div className="space-y-6">
            {isListLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Array.from({ length: 30 }).map((_, i) => (
                  <PokemonCardSkeleton key={i} />
                ))}
              </div>
            )}

            {isListError && (
              <div className="text-center py-16 px-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                  Error al cargar el listado de Pokémon
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                  No se pudo conectar con PokeAPI para obtener los Pokémon.
                </p>
                <button
                  type="button"
                  onClick={() => refetchList()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Reintentar conexión
                </button>
              </div>
            )}

            {!isListLoading && !isListError && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {infiniteData?.pages.flatMap((page) =>
                    page.results.map((pokemon) => (
                      <PokemonCard
                        key={pokemon.name}
                        name={pokemon.name}
                        url={pokemon.url}
                        onClick={() => handleSelect(pokemon.name)}
                      />
                    ))
                  )}
                </div>

                {/* Sentinel for Infinite Scroll */}
                <div ref={observerTarget} className="py-6 flex justify-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                      <span>Cargando más Pokémon (+30)...</span>
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-xs text-gray-400">Desplaza hacia abajo para cargar más</span>
                  ) : (
                    <span className="text-xs text-gray-400">Has llegado al final de la Pokédex</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
