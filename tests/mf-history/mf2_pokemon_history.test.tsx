import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PokemonHistory } from '../../apps/mf-history/src/PokemonHistory';
import { POKEMON_VISIT_EVENT, VisitedPokemon } from '@pokemon/shared';

describe('MF2: Historial de Visitas, Persistencia y Concurrencia (Fase 6)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Estados de Pantalla (Empty State y Loaded State)', () => {
    it('muestra estado vacío cuando no existen visitas registradas en localStorage', () => {
      render(<PokemonHistory />);

      expect(screen.getByText(/sin visitas registradas/i)).toBeInTheDocument();
      expect(screen.getByText(/0 pokémon visitados/i)).toBeInTheDocument();
    });

    it('renderiza la lista de Pokémon visitados con miniaturas y badge de visitas', () => {
      const initialHistory: VisitedPokemon[] = [
        { name: 'pikachu', image: 'https://img.com/pikachu.png', visits: 3 },
        { name: 'gengar', image: 'https://img.com/gengar.png', visits: 1 },
      ];
      localStorage.setItem('pokemon_history', JSON.stringify(initialHistory));

      render(<PokemonHistory />);

      expect(screen.getByText('pikachu')).toBeInTheDocument();
      expect(screen.getByText('gengar')).toBeInTheDocument();
      expect(screen.getByText('3 visitas')).toBeInTheDocument();
      expect(screen.getByText('1 visita')).toBeInTheDocument();
      expect(screen.getByText(/2 pokémon visitados \(4 visitas totales\)/i)).toBeInTheDocument();

      const img = screen.getByRole('img', { name: 'pikachu' });
      expect(img).toHaveAttribute('src', 'https://img.com/pikachu.png');
    });

    it('permite limpiar todo el historial al hacer clic en el botón Limpiar', () => {
      const initialHistory: VisitedPokemon[] = [
        { name: 'mewtwo', image: 'https://img.com/mewtwo.png', visits: 5 },
      ];
      localStorage.setItem('pokemon_history', JSON.stringify(initialHistory));

      render(<PokemonHistory />);

      const clearBtn = screen.getByRole('button', { name: /limpiar/i });
      fireEvent.click(clearBtn);

      expect(screen.getByText(/sin visitas registradas/i)).toBeInTheDocument();
      expect(localStorage.getItem('pokemon_history')).toBeNull();
    });

    it('ejecuta el callback onSelectPokemon al hacer clic en un elemento del historial', () => {
      const initialHistory: VisitedPokemon[] = [
        { name: 'snorlax', image: 'https://img.com/snorlax.png', visits: 2 },
      ];
      localStorage.setItem('pokemon_history', JSON.stringify(initialHistory));

      const onSelectPokemon = vi.fn();
      render(<PokemonHistory onSelectPokemon={onSelectPokemon} />);

      const historyItem = screen.getByText('snorlax').closest('[role="button"]')!;
      fireEvent.click(historyItem);

      expect(onSelectPokemon).toHaveBeenCalledWith('snorlax');
    });
  });

  describe('2. Sincronización en Tiempo Real y Cross-Tab (EventBus & Storage)', () => {
    it('actualiza reactivamente la lista cuando se emite el evento pokemon:visit en window', () => {
      render(<PokemonHistory />);

      expect(screen.getByText(/sin visitas registradas/i)).toBeInTheDocument();

      // Dispatch custom visit event as if MF1 just opened a pokemon
      act(() => {
        const visitEvent = new CustomEvent(POKEMON_VISIT_EVENT, {
          detail: {
            name: 'lucario',
            image: 'https://img.com/lucario.png',
          },
          bubbles: true,
        });
        window.dispatchEvent(visitEvent);
      });

      expect(screen.getByText('lucario')).toBeInTheDocument();
      expect(screen.getByText('1 visita')).toBeInTheDocument();

      // Check persistence in localStorage
      const saved = JSON.parse(localStorage.getItem('pokemon_history') || '[]');
      expect(saved[0].name).toBe('lucario');
      expect(saved[0].visits).toBe(1);
    });

    it('se sincroniza cuando otra pestaña modifica el historial (evento storage)', () => {
      render(<PokemonHistory />);

      const externalUpdate: VisitedPokemon[] = [
        { name: 'eevee', image: 'https://img.com/eevee.png', visits: 4 },
      ];
      localStorage.setItem('pokemon_history', JSON.stringify(externalUpdate));

      // Simulate storage event from another browser tab
      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'pokemon_history',
            newValue: JSON.stringify(externalUpdate),
          })
        );
      });

      expect(screen.getByText('eevee')).toBeInTheDocument();
      expect(screen.getByText('4 visitas')).toBeInTheDocument();
    });
  });

  describe('3. Estrés de Concurrencia en Event Bus y Persistencia Atómica', () => {
    it('procesa una ráfaga masiva de eventos consecutivos sin duplicar registros ni corromper contadores', () => {
      render(<PokemonHistory />);

      // Simular ráfaga rápida de 20 eventos con nombres repetidos
      // pikachu x 10, charizard x 5, mew x 5 = total 20 eventos, exactamente 3 pokémon únicos
      act(() => {
        for (let i = 0; i < 10; i++) {
          window.dispatchEvent(
            new CustomEvent(POKEMON_VISIT_EVENT, {
              detail: { name: 'pikachu', image: 'https://img.com/pikachu.png' },
            })
          );
        }
        for (let i = 0; i < 5; i++) {
          window.dispatchEvent(
            new CustomEvent(POKEMON_VISIT_EVENT, {
              detail: { name: 'charizard', image: 'https://img.com/charizard.png' },
            })
          );
        }
        for (let i = 0; i < 5; i++) {
          window.dispatchEvent(
            new CustomEvent(POKEMON_VISIT_EVENT, {
              detail: { name: 'mew', image: 'https://img.com/mew.png' },
            })
          );
        }
      });

      const saved: VisitedPokemon[] = JSON.parse(localStorage.getItem('pokemon_history') || '[]');

      // Must have exactly 3 unique pokemon (zero duplicates)
      expect(saved).toHaveLength(3);

      const pikachu = saved.find((p) => p.name === 'pikachu');
      const charizard = saved.find((p) => p.name === 'charizard');
      const mew = saved.find((p) => p.name === 'mew');

      expect(pikachu?.visits).toBe(10);
      expect(charizard?.visits).toBe(5);
      expect(mew?.visits).toBe(5);

      // Most recent should be at the front
      expect(saved[0].name).toBe('mew');
    });
  });
});
