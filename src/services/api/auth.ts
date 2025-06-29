import { api, setAuthToken } from './index';

interface LoginParams {
  email: string;
  password: string;
}

interface SignupParams {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  // Token is now stored in httpOnly cookie, not returned in response
  success: boolean;
  message?: string;
}

interface ResetPasswordParams {
  email: string;
}

interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  // Login with email and password
  async login(params: LoginParams): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', params);

      // With httpOnly cookies, the server automatically sets the auth cookie
      // We only store non-sensitive user info in localStorage
      if (response.user) {
        localStorage.setItem('authUser', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Login error:', error);
      }
      }
      throw error;
    }
  },

  // Sign up new user
  async signup(params: SignupParams): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', params);

      // With httpOnly cookies, the server automatically sets the auth cookie
      // We only store non-sensitive user info in localStorage
      if (response.user) {
        localStorage.setItem('authUser', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Signup error:', error);
      }
      }
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Logout error:', error);
      }
      }
    } finally {
      // Clear local storage
      localStorage.removeItem('authUser');
      localStorage.removeItem('premiumStatus');

      // With httpOnly cookies, the server clears the auth cookie
      // No client-side token management needed
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await api.get<{ user: AuthResponse['user'] }>('/auth/me');
      return response.user;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Get current user error:', error);
      }
      }
      return null;
    }
  },

  // Request password reset
  async requestPasswordReset(params: ResetPasswordParams): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', params);
      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Password reset request error:', error);
      }
      }
      throw error;
    }
  },

  // Update password
  async updatePassword(params: UpdatePasswordParams): Promise<{ message: string }> {
    try {
      const response = await api.put<{ message: string }>('/auth/update-password', params);
      return response;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Update password error:', error);
      }
      }
      throw error;
    }
  },

  // Check if user is authenticated
  // With httpOnly cookies, we check by trying to get current user
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  },

  // Synchronous check based on stored user (less reliable but faster)
  hasStoredUser(): boolean {
    const userStr = localStorage.getItem('authUser');
    return !!userStr;
  },

  // Get stored user
  getStoredUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('authUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Initialize auth state
  // With httpOnly cookies, no initialization needed as cookies are automatic
  initializeAuth(): void {
    // No action needed - httpOnly cookies are automatically sent
    // The server will validate the cookie on each request
  },
};