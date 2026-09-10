import React from 'react';

export interface RemoteLoadingFallbackProps {
  moduleName?: string;
}

export const RemoteLoadingFallback: React.FC<RemoteLoadingFallbackProps> = ({ moduleName = 'módulo' }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`Cargando ${moduleName}`}
      className="w-full p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-pulse"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-5 h-5 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Cargando {moduleName}...
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
};

export default RemoteLoadingFallback;
