import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemoteErrorBoundary } from '../../apps/shell/src/components/RemoteErrorBoundary';
import { RemoteLoadingFallback } from '../../apps/shell/src/components/RemoteLoadingFallback';
import { RemoteWrapper } from '../../apps/shell/src/components/RemoteWrapper';

// Mock component that throws an error conditionally
const BuggyRemoteComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Fallo simulado al cargar el microfrontend');
  }
  return <div>Microfrontend Remoto Cargado Exitosamente</div>;
};

describe('Resiliencia de Microfrontends (ErrorBoundary y Fallbacks - Fase 1)', () => {
  beforeEach(() => {
    // Suppress console.error in tests for expected thrown errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('1. RemoteLoadingFallback', () => {
    it('renderiza estructura de carga con aria-busy y role status', () => {
      render(<RemoteLoadingFallback moduleName="Detalle de Pokémon" />);

      const fallback = screen.getByRole('status', { name: /cargando detalle de pokémon/i });
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText(/cargando detalle de pokémon\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('2. RemoteErrorBoundary', () => {
    it('renderiza a los hijos normalmente cuando no hay error', () => {
      render(
        <RemoteErrorBoundary moduleName="MF1 Detalle">
          <div>Contenido Normal</div>
        </RemoteErrorBoundary>
      );

      expect(screen.getByText('Contenido Normal')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('captura el error del microfrontend caído y muestra UI de fallback elegante con alerta y reintento', () => {
      render(
        <RemoteErrorBoundary moduleName="MF1 Detalle">
          <BuggyRemoteComponent shouldCrash={true} />
        </RemoteErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/MF1 Detalle temporalmente no disponible/i)).toBeInTheDocument();
      expect(screen.getByText(/No se pudo establecer conexión con el microfrontend/i)).toBeInTheDocument();
      expect(screen.getByText(/Fallo simulado al cargar el microfrontend/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('permite reintentar la carga del microfrontend al presionar el botón Reintentar', () => {
      const onReset = vi.fn();

      const TestHarness = () => {
        const [hasError, setHasError] = useState(true);
        return (
          <RemoteErrorBoundary
            moduleName="MF1 Detalle"
            onReset={() => {
              onReset();
              setHasError(false);
            }}
          >
            <BuggyRemoteComponent shouldCrash={hasError} />
          </RemoteErrorBoundary>
        );
      };

      render(<TestHarness />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /reintentar/i });
      fireEvent.click(retryBtn);

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Microfrontend Remoto Cargado Exitosamente')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('permite proporcionar un fallback visual personalizado', () => {
      render(
        <RemoteErrorBoundary
          moduleName="MF1"
          fallback={<div data-testid="custom-fallback">Fallback Personalizado</div>}
        >
          <BuggyRemoteComponent shouldCrash={true} />
        </RemoteErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('3. RemoteWrapper', () => {
    it('envuelve el contenido permitiendo renderizado seguro', () => {
      render(
        <RemoteWrapper moduleName="MF2 Historial">
          <div>Contenido MF2 Seguro</div>
        </RemoteWrapper>
      );

      expect(screen.getByText('Contenido MF2 Seguro')).toBeInTheDocument();
    });
  });
});
