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
  token: string;
  expiresAt: string;
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

      // Store auth token
      if (response.token) {
        setAuthToken(response.token);
        localStorage.setItem('authUser', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Sign up new user
  async signup(params: SignupParams): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', params);

      // Store auth token
      if (response.token) {
        setAuthToken(response.token);
        localStorage.setItem('authUser', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authUser');
      localStorage.removeItem('premiumStatus');

      // Clear API token
      setAuthToken(null);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await api.get<{ user: AuthResponse['user'] }>('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Request password reset
  async requestPasswordReset(params: ResetPasswordParams): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', params);
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(params: UpdatePasswordParams): Promise<{ message: string }> {
    try {
      const response = await api.put<{ message: string }>('/auth/update-password', params);
      return response;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
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

  // Initialize auth from storage
  initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    }
  },
};