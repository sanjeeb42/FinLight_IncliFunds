import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService, type User, type AuthResponse } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    state?: string;
    language?: string;
    cultural_background?: string;
    religion?: string;
    phone?: string;
    preferred_language?: string;
    financial_knowledge_level?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: (data: any) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const response: AuthResponse = await apiService.login({ email, password });
        
        // Store token in localStorage
        localStorage.setItem('token', response.access_token);
        
        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (userData) => {
      set({ isLoading: true });
      try {
        const response: AuthResponse = await apiService.register(userData);
        
        // Store token in localStorage
        localStorage.setItem('token', response.access_token);
        
        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: () => {
      console.log('AuthStore: Logging out user');
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
      // Redirect to login page
      window.location.href = '/login';
    },

    updateProfile: (updates) => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, ...updates }
        });
      }
    },

    updateUser: (updates) => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, ...updates }
        });
      }
    },

    completeOnboarding: async (data) => {
      set({ isLoading: true });
      try {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            culturalProfile: data.cultural,
            financialGoals: data.goals ? [data.goals.primary] : [],
            growthScore: 750,
            onboardingCompleted: true
          };
          
          // Update user profile via API
          await apiService.updateProfile(updatedUser);
          
          set({
            user: updatedUser,
            isLoading: false
          });
        }
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    initializeAuth: async () => {
      const token = localStorage.getItem('token');
      console.log('AuthStore: Initializing auth, token exists:', !!token);
      if (token) {
        try {
          console.log('AuthStore: Verifying token with API...');
          const user = await apiService.getCurrentUser();
          console.log('AuthStore: Token valid, user:', user);
          set({
            user,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('AuthStore: Token verification failed:', error);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      } else {
        console.log('AuthStore: No token found');
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    },
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    }),
  }
));