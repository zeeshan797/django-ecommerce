import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  profile?: {
    phone_number: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    date_of_birth: string | null;
    profile_picture: string | null;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setAuth: (tokens: { access: string; refresh: string }, user?: User) => void;
  setUser: (user: User) => void;
  updateTokens: (tokens: { access: string; refresh: string }) => void;
  clearAuth: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setAuth: (tokens, user) => set({
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        user: user || null,
        error: null,
      }),
      
      setUser: (user) => set({ user }),
      
      updateTokens: (tokens) => set({
        accessToken: tokens.access,
        refreshToken: tokens.refresh,
      }),
      
      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      }),
      
      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);