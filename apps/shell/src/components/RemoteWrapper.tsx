import React, { Suspense, ReactNode } from 'react';
import { RemoteErrorBoundary } from './RemoteErrorBoundary';
import { RemoteLoadingFallback } from './RemoteLoadingFallback';

export interface RemoteWrapperProps {
  children: ReactNode;
  moduleName?: string;
  errorFallback?: ReactNode;
  loadingFallback?: ReactNode;
  onReset?: () => void;
}

export const RemoteWrapper: React.FC<RemoteWrapperProps> = ({
  children,
  moduleName = 'Módulo',
  errorFallback,
  loadingFallback,
  onReset,
}) => {
  return (
    <RemoteErrorBoundary moduleName={moduleName} fallback={errorFallback} onReset={onReset}>
      <Suspense fallback={loadingFallback ?? <RemoteLoadingFallback moduleName={moduleName} />}>
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  );
};

export default RemoteWrapper;
