import { create } from 'zustand';
import { Theme, ThemeState, STORAGE_KEYS } from '@pokemon/shared';

const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (err) {
    console.error('[ThemeStore] Error loading theme:', err);
  }
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  applyThemeToDocument(initialTheme);

  return {
    theme: initialTheme,
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (err) {
        console.error('[ThemeStore] Error saving theme:', err);
      }
      applyThemeToDocument(nextTheme);
      set({ theme: nextTheme });
    },
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (err) {
        console.error('[ThemeStore] Error saving theme:', err);
      }
      applyThemeToDocument(theme);
      set({ theme });
    },
  };
});
