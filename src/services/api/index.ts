// API configuration and base setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Cookie-based authentication - no client-side token management needed
// Tokens are stored in httpOnly cookies and automatically sent by browser
export const setAuthToken = (token: string | null) => {
  // For httpOnly cookies, the server handles setting/clearing cookies
  // This function is kept for backward compatibility but does nothing
  // The authentication state is managed by cookies automatically
};

export const getAuthToken = () => {
  // With httpOnly cookies, we can't access the token from JavaScript
  // Authentication state is handled by checking API responses
  return null;
};

// Base fetch wrapper with auth and error handling
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // No need to manually add Authorization header
  // httpOnly cookies are automatically sent with credentials: 'include'

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // This ensures httpOnly cookies are sent
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('API fetch error:', error);
    }
    throw error;
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => 
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => 
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};