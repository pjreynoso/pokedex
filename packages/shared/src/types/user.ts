export interface User {
  username: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
