import React, { useState } from 'react';
import PokemonDetail from './PokemonDetail';

export const App: React.FC = () => {
  const [pokemon, setPokemon] = useState<string>('charizard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 flex flex-col items-center">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400">
          MF1: Detalle de Pokémon (Standalone — Puerto 3001)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Exponiendo componente <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">./PokemonDetail</code>
        </p>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {['charizard', 'pikachu', 'gengar', 'mewtwo', 'lucario'].map((name) => (
            <button
              key={name}
              onClick={() => setPokemon(name)}
              className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                pokemon === name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-md">
        <PokemonDetail
          pokemonNameOrId={pokemon}
          onClose={() => setPokemon('')}
        />
      </main>
    </div>
  );
};

export default App;
