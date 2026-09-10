import { Component, ErrorInfo, ReactNode } from 'react';

export interface RemoteErrorBoundaryProps {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RemoteErrorBoundary extends Component<RemoteErrorBoundaryProps, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[RemoteErrorBoundary] Error al cargar ${this.props.moduleName ?? 'módulo remoto'}:`, error, errorInfo);
  }

  public resetError = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const moduleTitle = this.props.moduleName || 'Módulo Remoto';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="w-full p-6 border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 rounded-xl shadow-sm text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-3 text-xl">
            ⚠️
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {moduleTitle} temporalmente no disponible
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            No se pudo establecer conexión con el microfrontend. Por favor, verifica que el servicio esté activo e inténtalo nuevamente.
          </p>
          {this.state.error && (
            <p className="mt-2 text-xs font-mono text-red-700 dark:text-red-400/80 bg-red-100/50 dark:bg-red-900/30 py-1 px-2 rounded max-w-sm mx-auto truncate">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-4">
            <button
              type="button"
              onClick={this.resetError}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RemoteErrorBoundary;
