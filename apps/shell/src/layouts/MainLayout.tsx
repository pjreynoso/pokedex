import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SearchModal } from '../components/search/SearchModal';
import { LastVisitedToast } from '../components/toast/LastVisitedToast';
import { useUIStore } from '../store/uiStore';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSearchOpen, openSearch, closeSearch, setSelectedPokemon } = useUIStore();

  // Keyboard shortcut '/' to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      <Navbar onOpenSearch={openSearch} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children ? children : <Outlet />}
      </main>

      {/* Fullscreen Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelectPokemon={(name) => setSelectedPokemon(name)}
      />

      {/* Global Last Visited Toast on Reload */}
      <LastVisitedToast />
    </div>
  );
};

export default MainLayout;
