import { AuthService } from '@/services/auth.service';
import { UserInterface, UserRole } from '@/types/user.type';
import { Models } from 'appwrite';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: UserInterface | null;
  membership: Models.Membership | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  checkAuth: (teamId?: string) => Promise<boolean>;
  login: ({ teamId, email, password }: { teamId?: string, email: string, password: string }) => Promise<void>;
  register: ({
    teamId, name, email, mobilePhone, password, roles
  }: {
    teamId: string, name: string, email: string, mobilePhone: string, password: string, roles: string[]
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboarding: (completeOnboarding: boolean) => Promise<void>
  updateTeam: (updateTeam: string) => Promise<void>;
  createMemberShip: ({
    teamId, userId, email, roles
  }: {
    teamId: string, userId: string, email: string, roles: string
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      membership: null,
      isAuthenticated: false,
      isLoading: true,

      checkAuth: async (teamId?: string) => {
        set({ isLoading: true });
        try {
          const { user, membership } = await AuthService.getCurrentUser(teamId);

          set({
            user,
            membership,
            isAuthenticated: true,
            isLoading: false
          });

          return true;
        } catch {
          set({
            isLoading: false
          });
          return false;
        }
      },

      login: async ({
    teamId, email, password
  }: {
    teamId?: string, email: string, password: string
  }): Promise<void> => {
    set({ isLoading: true });
    try {
      await AuthService.login(email, password);
      await get().checkAuth(teamId);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

      register: async ({
        teamId, name, email, mobilePhone, password, roles
      }: {
        teamId: string, name: string, email: string, mobilePhone: string, password: string, roles: string[]
      }) => {
        set({ isLoading: true });
        try {
          const { user } = await AuthService.register({ name, email, mobilePhone, password });
          // Chama a API interna para adicionar ao team SaaS
          await fetch("/api/add-to-saas-team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamId, userId: user?.$id, email: user?.email, roles }),
          });
          await get().checkAuth();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
          set({
            user: null,
            isAuthenticated: false
          });
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        }
      },

      updateOnboarding: async (completeOnboarding: boolean) => {
        try {
          await AuthService.updateOnboarding(completeOnboarding)
        } catch (error) {
          console.error('Erro ao alterar a propriedade do usuário:', error);
        }
      },

      updateTeam: async (updateTeam: string) => {
        try {
          await AuthService.updateTeam(updateTeam)
        } catch (error) {
          console.error('Erro ao alterar a propriedade do usuário:', error);
        }
      },

      createMemberShip: async ({
        teamId, userId, email, roles
      }: {
        teamId: string, userId: string, email: string, roles: string
      }) => {
        set({ isLoading: true });
        try {
          await fetch("/api/add-to-saas-team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teamId, userId, email, roles }),
          });
          await get().checkAuth();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);