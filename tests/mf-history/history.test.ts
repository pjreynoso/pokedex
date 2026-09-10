import { describe, it, expect, beforeEach } from 'vitest';
import { VisitedPokemon } from '@pokemon/shared';

// Pure logic extractor representing the history recording rule in MF2
function updateVisitedHistory(
  prevHistory: VisitedPokemon[],
  pokemonName: string,
  image: string
): VisitedPokemon[] {
  const cleanName = pokemonName.trim().toLowerCase();
  const existingIndex = prevHistory.findIndex(
    (item) => item.name.toLowerCase() === cleanName
  );

  if (existingIndex >= 0) {
    const existing = prevHistory[existingIndex];
    const updated: VisitedPokemon = {
      ...existing,
      image: image || existing.image,
      visits: existing.visits + 1,
    };
    return [updated, ...prevHistory.filter((_, idx) => idx !== existingIndex)];
  }

  const newItem: VisitedPokemon = {
    name: cleanName,
    image,
    visits: 1,
  };
  return [newItem, ...prevHistory];
}

describe('Estrategia de Conteo de Visitas en Historial (MF2)', () => {
  let history: VisitedPokemon[];

  beforeEach(() => {
    history = [];
  });

  it('registra un nuevo Pokémon con 1 visita si no existía previamente', () => {
    history = updateVisitedHistory(history, 'pikachu', 'https://img.com/pikachu.png');

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({
      name: 'pikachu',
      image: 'https://img.com/pikachu.png',
      visits: 1,
    });
  });

  it('incrementa el contador de visitas sin duplicar el Pokémon si se visita varias veces', () => {
    history = updateVisitedHistory(history, 'charizard', 'https://img.com/charizard.png');
    history = updateVisitedHistory(history, 'charizard', 'https://img.com/charizard.png');
    history = updateVisitedHistory(history, 'Charizard', 'https://img.com/charizard.png');

    expect(history).toHaveLength(1);
    expect(history[0].name).toBe('charizard');
    expect(history[0].visits).toBe(3);
  });

  it('mantiene la posición más reciente al inicio de la lista cuando un Pokémon existente es revisitado', () => {
    history = updateVisitedHistory(history, 'bulbasaur', 'https://img.com/bulbasaur.png');
    history = updateVisitedHistory(history, 'charmander', 'https://img.com/charmander.png');
    history = updateVisitedHistory(history, 'squirtle', 'https://img.com/squirtle.png');

    expect(history.map((h) => h.name)).toEqual(['squirtle', 'charmander', 'bulbasaur']);

    // Revisit bulbasaur
    history = updateVisitedHistory(history, 'bulbasaur', 'https://img.com/bulbasaur.png');

    expect(history).toHaveLength(3);
    expect(history[0].name).toBe('bulbasaur');
    expect(history[0].visits).toBe(2);
    expect(history.map((h) => h.name)).toEqual(['bulbasaur', 'squirtle', 'charmander']);
  });
});
