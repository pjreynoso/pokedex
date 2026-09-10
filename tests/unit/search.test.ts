import { describe, it, expect } from 'vitest';
import { normalizePokemonSearch } from '../../apps/shell/src/hooks/usePokemonSearch';

describe('Búsqueda Exacta de Pokémon (Normalización y Filtros)', () => {
  it('convierte la entrada a minúsculas', () => {
    expect(normalizePokemonSearch('PIKACHU')).toBe('pikachu');
    expect(normalizePokemonSearch('ChaRiZard')).toBe('charizard');
  });

  it('elimina espacios en blanco iniciales, finales e intermedios', () => {
    expect(normalizePokemonSearch('  bulbasaur  ')).toBe('bulbasaur');
    expect(normalizePokemonSearch('snor lax')).toBe('snorlax');
  });

  it('elimina caracteres especiales y símbolos pero conserva guiones válidos', () => {
    expect(normalizePokemonSearch('mewtwo!@#$')).toBe('mewtwo');
    expect(normalizePokemonSearch('porygon-z')).toBe('porygon-z');
    expect(normalizePokemonSearch('ho-oh')).toBe('ho-oh');
    expect(normalizePokemonSearch('tapu-koko')).toBe('tapu-koko');
  });

  it('maneja strings vacíos o con solo espacios y caracteres inválidos', () => {
    expect(normalizePokemonSearch('')).toBe('');
    expect(normalizePokemonSearch('    ')).toBe('');
    expect(normalizePokemonSearch('$$$%%%')).toBe('');
  });
});
