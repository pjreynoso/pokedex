import React, { lazy, useRef } from 'react';
import { useAuthStore, useUIStore } from '../store';
import { CategorySection } from '../components/pokemon';
import { RemoteWrapper } from '../components/RemoteWrapper';
import { Sparkles, Layers } from 'lucide-react';

const RemotePokemonDetail = lazy(() => import('mf_detail/PokemonDetail'));
const RemotePokemonHistory = lazy(() => import('mf_history/PokemonHistory'));

const FEATURED_TYPES = ['fire', 'water', 'grass', 'electric'];

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { selectedPokemon, setSelectedPokemon } = useUIStore();
  const detailSectionRef = useRef<HTMLElement>(null);

  const handleSelectPokemon = (name: string) => {
    setSelectedPokemon(name);
    // Smooth scroll to detail preview if on mobile
    if (window.innerWidth < 1024) {
      detailSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Centro de Control Pokémon</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            ¡Hola, {user?.name ?? 'Entrenador'}!
          </h1>
          <p className="mt-2 text-red-100 text-sm sm:text-base leading-relaxed">
            Explora las categorías por tipo de la PokeAPI, selecciona tus Pokémon favoritos para visualizar su detalle en tiempo real a través del Microfrontend 1 y revisa tus visitas en el Microfrontend 2.
          </p>
        </div>
      </section>

      {/* Main Content Layout: Categories (Left/Top) & Microfrontends (Right/Bottom) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Categories Section (Span 2 cols on wide screens) */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-3">
            <Layers className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Categorías de Pokémon (PokeAPI)
            </h2>
          </div>

          <div className="space-y-8">
            {FEATURED_TYPES.map((type) => (
              <CategorySection
                key={type}
                type={type}
                onSelectPokemon={handleSelectPokemon}
              />
            ))}
          </div>
        </div>

        {/* Microfrontends Sidebar (MF1 and MF2) */}
        <div className="space-y-6">
          {/* Remote MF1: Detalle */}
          <section ref={detailSectionRef} id="mf-detail-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Microfrontend 1: Detalle
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                :3001
              </span>
            </div>
            <RemoteWrapper moduleName="Detalle de Pokémon (MF1)">
              <RemotePokemonDetail
                pokemonNameOrId={selectedPokemon}
                onClose={() => setSelectedPokemon(null)}
              />
            </RemoteWrapper>
          </section>

          {/* Remote MF2: Historial */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Microfrontend 2: Historial
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                :3002
              </span>
            </div>
            <RemoteWrapper moduleName="Historial de Visitas (MF2)">
              <RemotePokemonHistory
                onSelectPokemon={handleSelectPokemon}
              />
            </RemoteWrapper>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
