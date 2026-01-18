import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPrivate } from '@systemink/shared';

interface AuthState {
  user: UserPrivate | null;
  accessToken: string | null;
  refreshToken: string | null;
  isDarkMode: boolean;
  setUser: (user: UserPrivate | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  logout: () => void;
  toggleDarkMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isDarkMode: false,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },
      toggleDarkMode: () => {
        set((state) => {
          const isDark = !state.isDarkMode;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: isDark };
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isDarkMode: state.isDarkMode,
      }),
    },
  ),
);

// Initialize dark mode on load
if (useAuthStore.getState().isDarkMode) {
  document.documentElement.classList.add('dark');
}
