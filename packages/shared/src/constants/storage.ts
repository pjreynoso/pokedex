export const STORAGE_KEYS = {
  HISTORY: 'pokemon_history',
  LAST_VISITED: 'pokemon_last_visited',
  AUTH_SESSION: 'pokemon_auth_session',
  THEME: 'pokemon_theme',
  TOAST_DISMISSED: 'pokemon_toast_dismissed',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
