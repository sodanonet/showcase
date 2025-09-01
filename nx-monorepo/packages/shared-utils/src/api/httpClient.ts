// HTTP Client utility used across micro-frontends
export interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
}

class HttpClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL = '', defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...defaultConfig,
    };
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const { timeout, retries = 0, retryDelay = 1000, onRetry, ...fetchConfig } = mergedConfig;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

      try {
        const response = await fetch(fullUrl, {
          ...fetchConfig,
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          const error: ApiError = new Error(`HTTP Error: ${response.status}`);
          error.status = response.status;
          error.statusText = response.statusText;
          
          try {
            error.data = await response.json();
          } catch {
            error.data = await response.text();
          }
          
          throw error;
        }

        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          return await response.json();
        } else if (contentType.includes('text/')) {
          return (await response.text()) as unknown as T;
        } else {
          return (await response.blob()) as unknown as T;
        }

      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        
        const apiError = error as ApiError;
        
        // Don't retry on client errors (4xx)
        if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
          throw apiError;
        }

        // Retry on network errors and server errors (5xx)
        if (attempt < retries) {
          onRetry?.(attempt + 1, apiError);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        throw apiError;
      }
    }

    throw new Error('Request failed after all retry attempts');
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.executeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // Convenience method for form data
  async postForm<T>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const { headers, ...restConfig } = config || {};
    return this.executeRequest<T>(url, {
      ...restConfig,
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
    });
  }

  // Method to update base configuration
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultConfig.headers = {
      ...this.defaultConfig.headers,
      [key]: value,
    };
  }

  removeDefaultHeader(key: string): void {
    if (this.defaultConfig.headers) {
      delete (this.defaultConfig.headers as Record<string, string>)[key];
    }
  }
}

// Create default instance
export const httpClient = new HttpClient();

// Factory function for creating custom instances
export const createHttpClient = (baseURL?: string, config?: RequestConfig): HttpClient => {
  return new HttpClient(baseURL, config);
};

// Utility functions for common API patterns
export const createApiClient = (baseURL: string, token?: string) => {
  const client = new HttpClient(baseURL);
  
  if (token) {
    client.setDefaultHeader('Authorization', `Bearer ${token}`);
  }

  return {
    // Auth
    login: (credentials: any) => client.post('/auth/login', credentials),
    logout: () => client.post('/auth/logout'),
    refreshToken: () => client.post('/auth/refresh'),
    
    // CRUD operations
    get: <T>(endpoint: string) => client.get<T>(endpoint),
    create: <T>(endpoint: string, data: any) => client.post<T>(endpoint, data),
    update: <T>(endpoint: string, data: any) => client.put<T>(endpoint, data),
    patch: <T>(endpoint: string, data: any) => client.patch<T>(endpoint, data),
    delete: <T>(endpoint: string) => client.delete<T>(endpoint),
    
    // Pagination
    getPage: <T>(endpoint: string, page = 1, limit = 10) => 
      client.get<T>(`${endpoint}?page=${page}&limit=${limit}`),
    
    // Upload
    upload: <T>(endpoint: string, file: File, additionalData?: Record<string, any>) => {
      const formData = new FormData();
      formData.append('file', file);
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }
      return client.postForm<T>(endpoint, formData);
    },

    // Set auth token
    setToken: (token: string) => {
      client.setDefaultHeader('Authorization', `Bearer ${token}`);
    },

    // Remove auth token
    clearToken: () => {
      client.removeDefaultHeader('Authorization');
    },
  };
};