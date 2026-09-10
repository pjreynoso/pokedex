import React from 'react';
import PokemonHistory from './PokemonHistory';
import { POKEMON_VISIT_EVENT } from '@pokemon/shared';

export const App: React.FC = () => {
  const simulateVisit = (name: string, id: number) => {
    const event = new CustomEvent(POKEMON_VISIT_EVENT, {
      detail: {
        name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      },
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 flex flex-col items-center">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black text-green-600 dark:text-green-400">
          MF2: Historial de Visitas (Standalone — Puerto 3002)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Exponiendo componente <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">./PokemonHistory</code>
        </p>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => simulateVisit('pikachu', 25)}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow hover:bg-green-700 transition-colors"
          >
            + Simular Visita Pikachu (#25)
          </button>
          <button
            onClick={() => simulateVisit('charizard', 6)}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-green-600 text-white shadow hover:bg-green-700 transition-colors"
          >
            + Simular Visita Charizard (#6)
          </button>
        </div>
      </header>

      <main className="w-full max-w-md">
        <PokemonHistory
          onSelectPokemon={(name) => alert(`Seleccionado: ${name}`)}
        />
      </main>
    </div>
  );
};

export default App;
