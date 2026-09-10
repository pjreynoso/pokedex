import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RemoteWrapper } from '../../apps/shell/src/components/RemoteWrapper';
import { PokemonDetail } from '../../apps/mf-detail/src/PokemonDetail';
import { PokemonHistory } from '../../apps/mf-history/src/PokemonHistory';
import { POKEMON_VISIT_EVENT } from '@pokemon/shared';

describe('Integración de Microfrontends en el Shell (Regla General de Cobertura Dual)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Microfrontend 1 (Detalle) Integrado en Shell con RemoteWrapper', () => {
    it('muestra estado inicial vacío/prompt cuando el Shell no ha seleccionado ningún Pokémon', () => {
      render(
        <RemoteWrapper moduleName="Detalle de Pokémon (MF1)">
          <PokemonDetail pokemonNameOrId={null} />
        </RemoteWrapper>
      );

      expect(
        screen.getByText(/selecciona un pokémon de la lista o buscador para ver su detalle aquí/i)
      ).toBeInTheDocument();
    });

    it('renderiza la información completa del Pokémon cuando el Shell le pasa un nombre seleccionado', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 25,
          name: 'pikachu',
          height: 4,
          weight: 60,
          types: [{ slot: 1, type: { name: 'electric' } }],
          stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp' } }],
          sprites: {
            other: {
              dream_world: { front_default: 'https://img.com/pikachu.svg' },
            },
          },
        }),
      } as Response);

      render(
        <RemoteWrapper moduleName="Detalle de Pokémon (MF1)">
          <PokemonDetail pokemonNameOrId="pikachu" />
        </RemoteWrapper>
      );

      expect(await screen.findByText('pikachu')).toBeInTheDocument();
      expect(screen.getByText('#025')).toBeInTheDocument();
      expect(screen.getByText('electric')).toBeInTheDocument();
    });

    it('captura errores de carga y muestra fallback visual elegante sin romper el Shell si el remote falla', () => {
      const FailingRemote: React.FC = () => {
        throw new Error('Failed to fetch dynamically imported module: http://localhost:3001/assets/remoteEntry.js');
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <RemoteWrapper moduleName="Detalle de Pokémon (MF1)">
          <FailingRemote />
        </RemoteWrapper>
      );

      expect(screen.getByText(/temporalmente no disponible/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('2. Microfrontend 2 (Historial) Integrado en Shell con RemoteWrapper', () => {
    it('renderiza estado vacío amigable cuando no hay historial registrado', () => {
      render(
        <RemoteWrapper moduleName="Historial de Visitas (MF2)">
          <PokemonHistory />
        </RemoteWrapper>
      );

      expect(screen.getByText(/sin visitas registradas/i)).toBeInTheDocument();
    });

    it('se actualiza de forma reactiva cuando MF1 emite un evento pokemon:visit', async () => {
      render(
        <RemoteWrapper moduleName="Historial de Visitas (MF2)">
          <PokemonHistory />
        </RemoteWrapper>
      );

      act(() => {
        window.dispatchEvent(
          new CustomEvent(POKEMON_VISIT_EVENT, {
            detail: {
              name: 'gengar',
              image: 'https://img.com/gengar.png',
            },
          })
        );
      });

      expect(await screen.findByText('gengar')).toBeInTheDocument();
      expect(screen.getAllByText(/1 visita/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
