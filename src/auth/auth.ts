
const TOKEN_KEY = 'partners_ops_token';

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

  // Use relative path which goes through Vite proxy
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers
    });
  } catch (networkError) {
    // Catch fetch network errors (e.g., API offline)
    console.error("API Network Error:", networkError);
    throw new Error("Network Error: API unreachable");
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
    return {} as T;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      // Throw specialized error for AuthContext to catch
      throw new Error("Unauthorized");
    }
    const error = new Error(data.error?.message || 'API Request Failed');
    (error as any).code = data.error?.code;
    (error as any).status = response.status;
    throw error;
  }

  return data as T;
}
