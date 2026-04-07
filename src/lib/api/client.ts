import { env } from '@/lib/env';

/**
 * API Error class for typed error handling
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

/**
 * Base API Client for backend communication
 * Handles authentication, request/response formatting, and error handling
 */
class APIClient {
  private baseURL = env.NEXT_PUBLIC_API_URL;
  private getToken: (() => Promise<string | null>) | null = null;

  /**
   * Set the token getter function (to be called by Privy auth provider)
   * Pass null to clear the token getter
   */
  setTokenGetter(fn: (() => Promise<string | null>) | null): void {
    this.getToken = fn;
  }

  /**
   * Get the current auth token (for SSE URL authentication)
   */
  async getAuthToken(): Promise<string | null> {
    return this.getToken ? this.getToken() : null;
  }

  /**
   * Make an HTTP request to the backend
   */
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getToken ? await this.getToken() : null;

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      signal: options?.signal ?? AbortSignal.timeout(30_000),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new APIError(response.status, response.statusText, text);
    }

    try {
      return await response.json() as T;
    } catch {
      throw new APIError(response.status, response.statusText, "Invalid response format");
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new APIClient();
