import { apiFetch, parseJsonSafely, refreshAccessToken } from './http.client';
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  hasUsableSession,
  isSignedOut,
  markSignedOut,
  persistSession,
  type User,
} from './auth.session';

export type { User } from './auth.session';

export interface AuthResponse {
  token: string;
  user: User;
}

interface LoginApiResponse {
  data?: {
    token?: string;
    expires_in?: number;
    username?: string;
    token_type?: string;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    let response: Response;

    try {
      response = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: 'none',
        retryOnUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: '',
          email: credentials.email,
          password: credentials.password,
        }),
      });
    } catch {
      throw new Error('Unable to reach auth service');
    }

    const payload = await parseJsonSafely(response) as LoginApiResponse | null;

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.message ??
        (payload as any)?.error ??
        (payload as any)?.details ??
        `Login failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const token = payload?.data?.token;
    const username = payload?.data?.username;

    if (!token || !username) {
      throw new Error('Invalid auth response');
    }

    const user = persistSession(token, username, {
      email: credentials.email,
      timestamp: payload?.meta?.timestamp,
    });

    return { token, user };
  },

  async ensureAuthenticated(): Promise<boolean> {
    if (isSignedOut()) {
      return false;
    }

    if (hasUsableSession()) {
      return true;
    }

    return refreshAccessToken();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(800);
    throw new Error(`Register is not wired to the backend yet for ${data.email}`);
  },

  async resetPassword(email: string): Promise<void> {
    await delay(800);
    console.log(`Password reset email sent to ${email}`);
  },

  async verifyEmail(): Promise<void> {
    await delay(500);
    const user = this.getCurrentUser();
    if (user) {
      user.emailVerified = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('movievault_user', JSON.stringify(user));
      }
    }
  },

  logout(): void {
    markSignedOut();
  },

  clearSession(): void {
    clearSession();
  },

  getToken(): string | null {
    return getStoredToken();
  },

  getCurrentUser(): User | null {
    return getStoredUser();
  },

  isAuthenticated(): boolean {
    return hasUsableSession();
  }
};
