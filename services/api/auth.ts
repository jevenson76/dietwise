import { apiClient } from './client';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  timezone?: string;
  locale?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response;
    } catch (error: any) {
      // Provide specific error messages based on status code
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid registration data');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      }
      throw error;
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response;
    } catch (error: any) {
      // Provide specific error messages based on status code
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error('Please check your login credentials');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Ignore errors during logout
    }

    apiClient.logout();
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.get('/auth/verify-email', { token });
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid or expired verification token');
      } else if (error.response?.status === 404) {
        throw new Error('Verification token not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later');
      }
      throw error;
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};