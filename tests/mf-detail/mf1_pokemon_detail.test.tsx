import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PokemonDetail } from '../../apps/mf-detail/src/PokemonDetail';
import { POKEMON_VISIT_EVENT, Pokemon } from '@pokemon/shared';

describe('MF1: Detalle de Pokémon, Contratos y Event Bus (Fase 5)', () => {
  const mockCharizard: Pokemon = {
    id: 6,
    name: 'charizard',
    height: 17,
    weight: 905,
    types: [
      { slot: 1, type: { name: 'fire', url: '' } },
      { slot: 2, type: { name: 'flying', url: '' } },
    ],
    stats: [
      { base_stat: 78, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 84, effort: 0, stat: { name: 'attack', url: '' } },
      { base_stat: 78, effort: 0, stat: { name: 'defense', url: '' } },
      { base_stat: 109, effort: 3, stat: { name: 'special-attack', url: '' } },
      { base_stat: 85, effort: 0, stat: { name: 'special-defense', url: '' } },
      { base_stat: 100, effort: 0, stat: { name: 'speed', url: '' } },
    ],
    sprites: {
      front_default: 'https://img.com/charizard-front.png',
      other: {
        dream_world: {
          front_default: 'https://img.com/charizard.svg',
        },
        'official-artwork': {
          front_default: 'https://img.com/charizard-artwork.png',
        },
      },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Estados de Pantalla (Prompt, Loading, Error, Loaded)', () => {
    it('muestra mensaje informativo cuando no hay ningún Pokémon seleccionado', () => {
      render(<PokemonDetail pokemonNameOrId={null} />);

      expect(
        screen.getByText(/selecciona un pokémon de la lista o buscador para ver su detalle aquí/i)
      ).toBeInTheDocument();
    });

    it('muestra skeleton loader mientras se realiza la petición HTTP a PokeAPI', () => {
      // Mock pending fetch
      vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

      render(<PokemonDetail pokemonNameOrId="charizard" />);

      expect(screen.getByRole('status', { name: /cargando detalles del pokémon/i })).toBeInTheDocument();
    });

    it('muestra mensaje de error amigable y botón de reintentar si el Pokémon no existe o falla la red', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      render(<PokemonDetail pokemonNameOrId="noexiste" />);

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/no se encontró el pokémon/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });
  });

  describe('2. Cobertura Visual (Datos mínimos, SVG/Artwork, Tipos y Stats)', () => {
    it('renderiza la imagen SVG, nombre, insignias de tipo, altura, peso y barras de stats', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharizard,
      } as Response);

      render(<PokemonDetail pokemonNameOrId="charizard" />);

      // Name & ID
      expect(await screen.findByText('charizard')).toBeInTheDocument();
      expect(screen.getByText('#006')).toBeInTheDocument();

      // SVG Image preferred
      const img = screen.getByRole('img', { name: 'charizard' });
      expect(img).toHaveAttribute('src', 'https://img.com/charizard.svg');

      // Types badges
      expect(screen.getByText('fire')).toBeInTheDocument();
      expect(screen.getByText('flying')).toBeInTheDocument();

      // Formatted height & weight (1.7 m, 90.5 kg)
      expect(screen.getByText('1.7 m')).toBeInTheDocument();
      expect(screen.getByText('90.5 kg')).toBeInTheDocument();

      // Stats
      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getAllByText('78')).toHaveLength(2); // HP and Defense
      expect(screen.getByText('Ataque')).toBeInTheDocument();
      expect(screen.getByText('84')).toBeInTheDocument();
      expect(screen.getByText('Velocidad')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('permite cerrar el detalle mediante el botón de cierre si se proporciona onClose', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharizard,
      } as Response);

      const onClose = vi.fn();
      render(<PokemonDetail pokemonNameOrId="charizard" onClose={onClose} />);

      const closeBtn = await screen.findByRole('button', { name: /cerrar detalle/i });
      fireEvent.click(closeBtn);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Contratos de Microfrontends y Event Bus (POKEMON_VISIT_EVENT)', () => {
    it('emite el evento pokemon:visit en window con los datos del Pokémon al cargarse', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharizard,
      } as Response);

      const eventListener = vi.fn();
      window.addEventListener(POKEMON_VISIT_EVENT, eventListener);

      render(<PokemonDetail pokemonNameOrId="charizard" />);

      await waitFor(() => {
        expect(eventListener).toHaveBeenCalledTimes(1);
      });

      const emittedEvent = eventListener.mock.calls[0][0] as CustomEvent;
      expect(emittedEvent.detail).toEqual({
        name: 'charizard',
        image: 'https://img.com/charizard.svg',
      });

      window.removeEventListener(POKEMON_VISIT_EVENT, eventListener);
    });

    it('desduplica emisiones evitando disparar múltiples eventos si el mismo Pokémon no ha cambiado', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockCharizard,
      } as Response);

      const eventListener = vi.fn();
      window.addEventListener(POKEMON_VISIT_EVENT, eventListener);

      const { rerender } = render(<PokemonDetail pokemonNameOrId="charizard" />);

      await waitFor(() => {
        expect(eventListener).toHaveBeenCalledTimes(1);
      });

      // Re-render with same pokemon
      rerender(<PokemonDetail pokemonNameOrId="charizard" />);

      // Should still be exactly 1 call
      expect(eventListener).toHaveBeenCalledTimes(1);

      window.removeEventListener(POKEMON_VISIT_EVENT, eventListener);
    });
  });
});
