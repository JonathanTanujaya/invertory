import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'light',
      sidebarCollapsed: false,
      
      toggleTheme: () => set((state) => ({
        mode: state.mode === 'light' ? 'dark' : 'light'
      })),
      
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
