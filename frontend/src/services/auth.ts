const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";
const BASE_URL = "http://localhost:3001/api";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logout(): void {
  clearSession();
  window.location.href = "/login";
}

// Fetch wrapper that automatically attaches the Authorization header.
// On 401, clears the session and redirects to /login.
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.href = "/login";
  }

  return res;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Login failed");
  }
  const data = await res.json() as { accessToken: string; user: AuthUser };
  setSession(data.accessToken, data.user);
  return data.user;
}

export async function signup(email: string, password: string, name?: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Signup failed");
  }
  const data = await res.json() as { accessToken: string; user: AuthUser };
  setSession(data.accessToken, data.user);
  return data.user;
}
