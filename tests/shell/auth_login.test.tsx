import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuthStore } from '../../apps/shell/src/store/authStore';
import { LoginPage } from '../../apps/shell/src/pages/LoginPage';
import { renderWithProviders } from '../utils/test-wrapper';

describe('Autenticación y Pantalla de Login (Fase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  });

  describe('1. Cobertura Funcional (useAuthStore)', () => {
    it('inicia con estado no autenticado y sin usuario', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('falla el inicio de sesión si el nombre de usuario está vacío', async () => {
      const success = await useAuthStore.getState().login('');
      expect(success).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('El nombre de usuario es obligatorio.');
    });

    it('falla el inicio de sesión si la contraseña tiene menos de 4 caracteres', async () => {
      const success = await useAuthStore.getState().login('ash', '123');
      expect(success).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe('La contraseña debe tener al menos 4 caracteres.');
    });

    it('inicia sesión exitosamente y persiste en localStorage', async () => {
      const success = await useAuthStore.getState().login('ash', 'pikachu123');
      expect(success).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.username).toBe('ash');
      expect(state.user?.name).toBe('Ash');

      const saved = JSON.parse(localStorage.getItem('pokemon_auth_session') || '{}');
      expect(saved.username).toBe('ash');
    });

    it('cierra sesión correctamente y remueve la sesión de localStorage', async () => {
      await useAuthStore.getState().login('ash', 'pikachu123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(localStorage.getItem('pokemon_auth_session')).toBeNull();
    });
  });

  describe('2. Cobertura de UI y Pantalla de Login', () => {
    it('renderiza los campos de usuario, contraseña y botón de ingresar', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ingresar al shell/i })).toBeInTheDocument();
    });

    it('muestra errores de validación si los campos requeridos se dejan vacíos', async () => {
      renderWithProviders(<LoginPage />);

      const userInput = screen.getByLabelText(/nombre de usuario/i);
      const passInput = screen.getByLabelText(/^contraseña$/i);
      const submitBtn = screen.getByRole('button', { name: /ingresar al shell/i });

      fireEvent.change(userInput, { target: { value: '' } });
      fireEvent.change(passInput, { target: { value: '' } });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/por favor ingresa tu nombre de usuario/i)).toBeInTheDocument();
      expect(await screen.findByText(/por favor ingresa tu contraseña/i)).toBeInTheDocument();
    });

    it('permite alternar la visibilidad de la contraseña (Eye / EyeOff)', () => {
      renderWithProviders(<LoginPage />);

      const passInput = screen.getByLabelText(/^contraseña$/i);
      const toggleBtn = screen.getByLabelText(/ver contraseña/i);

      expect(passInput).toHaveAttribute('type', 'password');

      fireEvent.click(toggleBtn);
      expect(passInput).toHaveAttribute('type', 'text');

      const hideBtn = screen.getByLabelText(/ocultar contraseña/i);
      fireEvent.click(hideBtn);
      expect(passInput).toHaveAttribute('type', 'password');
    });

    it('rellena credenciales al hacer clic en los botones de acceso rápido', () => {
      renderWithProviders(<LoginPage />);

      const mistyQuickBtn = screen.getByRole('button', { name: /misty \/ starmie456/i });
      fireEvent.click(mistyQuickBtn);

      const userInput = screen.getByLabelText(/nombre de usuario/i) as HTMLInputElement;
      const passInput = screen.getByLabelText(/^contraseña$/i) as HTMLInputElement;

      expect(userInput.value).toBe('misty');
      expect(passInput.value).toBe('starmie456');
    });

    it('muestra estado de carga deshabilitando el botón mientras se procesa el login', async () => {
      renderWithProviders(<LoginPage />);

      const submitBtn = screen.getByRole('button', { name: /ingresar al shell/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
      }, { timeout: 1500 });
    });

    it('permite alternar entre tema claro y oscuro desde la pantalla de login', () => {
      renderWithProviders(<LoginPage />);

      const themeToggleBtn = screen.getByRole('button', { name: /cambiar a modo (claro|oscuro)/i });
      expect(themeToggleBtn).toBeInTheDocument();

      const initialLabel = themeToggleBtn.getAttribute('aria-label');
      fireEvent.click(themeToggleBtn);

      const nextLabel = themeToggleBtn.getAttribute('aria-label');
      expect(nextLabel).not.toBe(initialLabel);
    });
  });
});
