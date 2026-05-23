import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true, // starts loading until hydration or session check
      login: (accessToken: string, user: User) => 
        set({ accessToken, user, isAuthenticated: true, isLoading: false }),
      logout: () => 
        set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false }),
      setLoading: (isLoading: boolean) => 
        set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      // We only persist the token and basic info, but usually checking the session via /me is preferred.
      // However, for this requirement, we'll persist it to maintain session across reloads.
    }
  )
);
