import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonCard } from '../../apps/shell/src/components/pokemon/PokemonCard';
import { PokemonCardSkeleton } from '../../apps/shell/src/components/pokemon/PokemonCardSkeleton';
import { extractPokemonIdFromUrl, getPokemonArtworkUrl } from '../../apps/shell/src/api/pokemonApi';

describe('Tarjetas de Pokémon e Imágenes (Dimensión 2 y Accesibilidad)', () => {
  describe('1. Utilidades de URL e ID de Pokémon', () => {
    it('extrae correctamente el ID numérico desde una URL de PokeAPI', () => {
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/6/')).toBe(6);
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/1025/')).toBe(1025);
    });

    it('genera la URL oficial del artwork en alta resolución', () => {
      expect(getPokemonArtworkUrl(25)).toBe(
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      );
    });
  });

  describe('2. Componente PokemonCard y Renderizado de Imágenes', () => {
    it('renderiza la imagen del Pokémon con URL válida y alt descriptivo', () => {
      render(
        <PokemonCard
          name="pikachu"
          id={25}
        />
      );

      const img = screen.getByRole('img', { name: 'pikachu' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', getPokemonArtworkUrl(25));
      expect(img).toHaveAttribute('alt', 'pikachu');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('muestra el badge con el ID formateado a tres dígitos (#025)', () => {
      render(
        <PokemonCard
          name="pikachu"
          id={25}
        />
      );

      expect(screen.getByText('#025')).toBeInTheDocument();
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });

    it('maneja la transición de placeholder/skeleton a imagen visible tras el evento load', () => {
      render(
        <PokemonCard
          name="charizard"
          id={6}
        />
      );

      const img = screen.getByRole('img', { name: 'charizard' });
      // Initially has opacity-0 class before onLoad
      expect(img.className).toContain('opacity-0');

      // Trigger load event
      fireEvent.load(img);
      expect(img.className).toContain('opacity-100');
    });

    it('soporta navegación y selección mediante teclado (Enter y Space)', () => {
      const handleClick = vi.fn();
      render(
        <PokemonCard
          name="bulbasaur"
          id={1}
          onClick={handleClick}
        />
      );

      const card = screen.getByRole('button', { name: /ver detalles de bulbasaur #001/i });

      // Test Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Test Space
      fireEvent.keyDown(card, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(2);

      // Test regular click
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('muestra fallback amigable y detiene el skeleton si la imagen falla al cargar (onError)', () => {
      render(
        <PokemonCard
          name="mew"
          id={151}
        />
      );

      const img = screen.getByRole('img', { name: 'mew' });
      fireEvent.error(img);

      expect(screen.getByText('Sin imagen')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('3. Componente PokemonCardSkeleton', () => {
    it('renderiza estructura de carga accesible con role status', () => {
      render(<PokemonCardSkeleton />);

      const skeleton = screen.getByRole('status', { name: /cargando pokémon/i });
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('animate-pulse');
    });
  });
});
