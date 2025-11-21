import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      
      setAuth: (user, token, role) => set({ user, token, role }),
      
      logout: () => set({ user: null, token: null, role: null }),
      
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },
      
      hasRole: (requiredRole) => {
        const state = useAuthStore.getState();
        return state.role === requiredRole;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
