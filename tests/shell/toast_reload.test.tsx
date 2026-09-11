import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LastVisitedToast, LastVisitedRecord } from '../../apps/shell/src/components/toast/LastVisitedToast';
import { useUIStore } from '../../apps/shell/src/store/uiStore';
import { POKEMON_VISIT_EVENT } from '@pokemon/shared';

describe('Shell: Toast al Recargar y Regla de Descarte (Fase 7)', () => {
  const LAST_VISITED_KEY = 'pokemon_last_visited';
  const TOAST_DISMISSED_KEY = 'pokemon_toast_dismissed';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    useUIStore.setState({ selectedPokemon: null });
  });

  it('no muestra el toast si no hay ningún último Pokémon guardado en localStorage', () => {
    render(<LastVisitedToast />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el toast flotante con la información del último Pokémon visitado si no ha sido descartado', () => {
    const record: LastVisitedRecord = {
      name: 'pikachu',
      image: 'https://img.com/pikachu.png',
      timestamp: Date.now(),
    };
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(record));

    render(<LastVisitedToast />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/último pokémon visitado/i)).toBeInTheDocument();
    expect(screen.getByText('pikachu')).toBeInTheDocument();

    const img = screen.getByRole('img', { name: 'pikachu' });
    expect(img).toHaveAttribute('src', 'https://img.com/pikachu.png');
  });

  it('al hacer clic en Cerrar, oculta el toast y guarda la marca de tiempo de descarte', () => {
    const now = Date.now();
    const record: LastVisitedRecord = {
      name: 'charizard',
      image: 'https://img.com/charizard.png',
      timestamp: now,
    };
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(record));

    render(<LastVisitedToast />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const dismissed = JSON.parse(localStorage.getItem(TOAST_DISMISSED_KEY) || '{}');
    expect(dismissed.timestamp).toBe(now);
  });

  it('al recargar la página (re-render), no vuelve a mostrar el toast si ya fue descartado', () => {
    const now = Date.now();
    const record: LastVisitedRecord = {
      name: 'charizard',
      image: 'https://img.com/charizard.png',
      timestamp: now,
    };
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(record));
    localStorage.setItem(TOAST_DISMISSED_KEY, JSON.stringify({ timestamp: now }));

    // Simulating page reload
    render(<LastVisitedToast />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('vuelve a mostrar el toast cuando se produce una nueva visita a otro Pokémon', () => {
    const past = Date.now() - 10000;
    const initialRecord: LastVisitedRecord = {
      name: 'bulbasaur',
      image: 'https://img.com/bulbasaur.png',
      timestamp: past,
    };
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(initialRecord));
    localStorage.setItem(TOAST_DISMISSED_KEY, JSON.stringify({ timestamp: past }));

    const { rerender } = render(<LastVisitedToast />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Now a new visit occurs
    act(() => {
      window.dispatchEvent(
        new CustomEvent(POKEMON_VISIT_EVENT, {
          detail: {
            name: 'mewtwo',
            image: 'https://img.com/mewtwo.png',
          },
        })
      );
    });

    rerender(<LastVisitedToast />);

    // Verify localStorage has the new visit with newer timestamp
    const updatedVisit: LastVisitedRecord = JSON.parse(
      localStorage.getItem(LAST_VISITED_KEY) || '{}'
    );
    expect(updatedVisit.name).toBe('mewtwo');
    expect(updatedVisit.timestamp).toBeGreaterThan(past);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('mewtwo')).toBeInTheDocument();
  });

  it('el botón "Ver detalle" actualiza el store de UI y cierra el toast', () => {
    const record: LastVisitedRecord = {
      name: 'gengar',
      image: 'https://img.com/gengar.png',
      timestamp: Date.now(),
    };
    localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(record));

    render(<LastVisitedToast />);

    const viewDetailBtn = screen.getByRole('button', { name: /ver detalle/i });
    fireEvent.click(viewDetailBtn);

    expect(useUIStore.getState().selectedPokemon).toBe('gengar');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
