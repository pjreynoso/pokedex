import { create } from 'zustand';
import { User, AuthState, STORAGE_KEYS } from '@pokemon/shared';

const AUTH_STORAGE_KEY = STORAGE_KEYS.AUTH_SESSION;

export interface AuthStore extends AuthState {
  isLoading: boolean;
  error: string | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const getInitialSession = (): { user: User | null; isAuthenticated: boolean } => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.username) {
        return { user: parsed, isAuthenticated: true };
      }
    }
  } catch (err) {
    console.error('[AuthStore] Error loading session from localStorage:', err);
  }
  return { user: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthStore>((set) => {
  const initial = getInitialSession();

  return {
    isAuthenticated: initial.isAuthenticated,
    user: initial.user,
    isLoading: false,
    error: null,

    login: async (username: string, password?: string): Promise<boolean> => {
      set({ isLoading: true, error: null });

      // Artificial small delay for UX loading feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      const cleanUsername = username.trim();

      if (!cleanUsername) {
        set({
          isLoading: false,
          error: 'El nombre de usuario es obligatorio.',
        });
        return false;
      }

      if (password !== undefined && password.trim().length < 4) {
        set({
          isLoading: false,
          error: 'La contraseña debe tener al menos 4 caracteres.',
        });
        return false;
      }

      const authenticatedUser: User = {
        username: cleanUsername,
        name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        email: `${cleanUsername.toLowerCase()}@pokeleague.com`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch (err) {
        console.error('[AuthStore] Error saving session to localStorage:', err);
      }

      set({
        isAuthenticated: true,
        user: authenticatedUser,
        isLoading: false,
        error: null,
      });

      return true;
    },

    logout: (): void => {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (err) {
        console.error('[AuthStore] Error removing session from localStorage:', err);
      }
      set({
        isAuthenticated: false,
        user: null,
        error: null,
      });
    },

    clearError: (): void => set({ error: null }),
  };
});
