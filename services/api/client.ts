import axios, { AxiosInstance, AxiosError } from 'axios';
import { log } from '../../src/services/loggingService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and start time
    this.client.interceptors.request.use(
      async (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add request start time for duration calculation
        (config as any)._requestStartTime = Date.now();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and logging
    this.client.interceptors.response.use(
      (response) => {
        // Log successful API calls
        const duration = Date.now() - (response.config as any)._requestStartTime;
        log.apiCall(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || 'unknown-url',
          response.status,
          duration,
          'api-client'
        );
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            log.error('Token refresh failed', 'api-client', { error: refreshError });
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Log failed API calls
        const duration = Date.now() - (originalRequest._requestStartTime || Date.now());
        log.apiCall(
          originalRequest.method?.toUpperCase() || 'UNKNOWN',
          originalRequest.url || 'unknown-url',
          error.response?.status || 0,
          duration,
          'api-client'
        );

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();