import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { useThemeStore } from '../../apps/shell/src/store/themeStore';
import { useAuthStore } from '../../apps/shell/src/store/authStore';
import { Navbar } from '../../apps/shell/src/components/Navbar';
import { renderWithProviders } from '../utils/test-wrapper';

describe('Tema y Navegación Global (Navbar - Fase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({ theme: 'light' });
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        username: 'ash',
        name: 'Ash Ketchum',
        email: 'ash@pokeleague.com',
        avatar: 'https://avatar.com/ash.svg',
      },
    });
  });

  describe('1. Cobertura Funcional y Persistencia del Tema', () => {
    it('alterna entre tema claro y oscuro modificando la clase del documento', () => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persiste el tema en localStorage bajo la clave pokemon_theme', () => {
      useThemeStore.getState().toggleTheme();
      expect(localStorage.getItem('pokemon_theme')).toBe('dark');
    });
  });

  describe('2. Cobertura de UI y Estados del Navbar', () => {
    it('renderiza la marca Pokéball, el botón de tema y el botón de búsqueda', () => {
      const onOpenSearch = vi.fn();
      renderWithProviders(<Navbar onOpenSearch={onOpenSearch} />);

      expect(screen.getByText(/Poke/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cambiar a modo oscuro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/abrir buscador de pokémon/i)).toBeInTheDocument();
    });

    it('ejecuta el callback onOpenSearch al hacer clic en el botón de búsqueda', () => {
      const onOpenSearch = vi.fn();
      renderWithProviders(<Navbar onOpenSearch={onOpenSearch} />);

      const searchBtn = screen.getByLabelText(/abrir buscador de pokémon/i);
      fireEvent.click(searchBtn);

      expect(onOpenSearch).toHaveBeenCalledTimes(1);
    });

    it('alterna el tema al hacer clic en el botón selector de tema', () => {
      renderWithProviders(<Navbar />);

      const themeBtn = screen.getByLabelText(/cambiar a modo oscuro/i);
      fireEvent.click(themeBtn);

      expect(useThemeStore.getState().theme).toBe('dark');
      expect(screen.getByLabelText(/cambiar a modo claro/i)).toBeInTheDocument();
    });

    it('abre el menú desplegable de usuario al hacer clic y permite cerrar sesión', () => {
      renderWithProviders(<Navbar />);

      // Verify dropdown is not open initially
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      // Click user button
      const userBtn = screen.getByRole('button', { name: /Ash Ketchum/i });
      fireEvent.click(userBtn);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('ash@pokeleague.com')).toBeInTheDocument();

      // Click logout
      const logoutBtn = screen.getByRole('menuitem', { name: /cerrar sesión/i });
      fireEvent.click(logoutBtn);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('cierra el menú desplegable al hacer clic fuera de él', () => {
      renderWithProviders(
        <div>
          <div data-testid="outside">Afuera</div>
          <Navbar />
        </div>
      );

      const userBtn = screen.getByRole('button', { name: /Ash Ketchum/i });
      fireEvent.click(userBtn);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('cierra el menú desplegable al presionar la tecla Escape (WCAG 2.2 a11y)', () => {
      renderWithProviders(<Navbar />);

      const userBtn = screen.getByRole('button', { name: /Ash Ketchum/i });
      fireEvent.click(userBtn);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });
});
