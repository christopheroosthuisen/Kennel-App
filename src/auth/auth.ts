
const TOKEN_KEY = 'partners_ops_token';
const API_BASE = 'http://localhost:8787';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions extends RequestInit {
  data?: any;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.data) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      // Optional: Trigger global event or redirect if needed, 
      // but usually Context handles the state change on next check.
    }
    const error = new Error(data.error?.message || 'API Request Failed');
    (error as any).code = data.error?.code;
    (error as any).status = response.status;
    throw error;
  }

  return data as T;
}
