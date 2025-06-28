import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../src/services/api/auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is stored locally
      const storedUser = authApi.getStoredUser();

      if (storedUser && authApi.isAuthenticated()) {
        // Initialize API with stored token
        authApi.initializeAuth();

        // Verify token is still valid by fetching current user
        const currentUser = await authApi.getCurrentUser();

        if (currentUser) {
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token is invalid, clear auth
          await authApi.logout();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to initialize auth:', error);
      }
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setAuthState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
    return response;
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const response = await authApi.signup({ email, password, name });
    setAuthState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
    });
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
    localStorage.setItem('authUser', JSON.stringify(user));
  }, []);

  return {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
    refreshAuth: initializeAuth,
  };
};