import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      login: async (username: string, password: string) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();

          if (error) {
            return { success: false, error: 'Errore di connessione' };
          }

          if (!data) {
            return { success: false, error: 'Credenziali non valide' };
          }

          if (data.password_hash !== password) {
            return { success: false, error: 'Credenziali non valide' };
          }

          const user: User = {
            id: data.id,
            username: data.username,
            role: data.role,
            created_at: data.created_at,
          };

          set({ user });
          return { success: true };
        } catch {
          return { success: false, error: 'Errore durante il login' };
        }
      },

      logout: () => {
        set({ user: null });
      },

      checkAuth: () => {
        const state = get();
        set({ isLoading: false });
        return state.user;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
