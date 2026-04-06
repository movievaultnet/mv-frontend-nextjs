import { buildApiUrl } from './api.config';
import { coreFetch, type CoreFetchOptions, parseJsonSafely } from './api.client';
import {
  clearSession,
  getStoredUser,
  isSignedOut,
  persistSession,
} from './auth.session';

export { parseJsonSafely } from './api.client';

interface RefreshTokenResponseDto {
  data?: {
    token?: string;
    token_type?: string;
    expires_in?: number;
    username?: string;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface ApiRequestOptions extends CoreFetchOptions {
  auth?: 'none' | 'optional' | 'required';
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function performFetch(path: string, options: ApiRequestOptions = {}) {
  const { auth = 'optional', retryOnUnauthorized = auth === 'required', headers, ...init } = options;

  const response = await coreFetch(path, {
    ...init,
    headers,
  });

  if (response.status !== 401 || auth !== 'required' || !retryOnUnauthorized || path === '/api/auth/refresh') {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    return response;
  }

  return coreFetch(path, {
    ...init,
    headers,
  });
}

export async function apiFetch(path: string, options: ApiRequestOptions = {}) {
  return performFetch(path, options);
}

export async function refreshAccessToken(): Promise<boolean> {
  if (isSignedOut()) {
    return false;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    let response: Response;

    try {
      response = await fetch(buildApiUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      return false;
    }

    const payload = await parseJsonSafely(response) as RefreshTokenResponseDto | null;

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearSession();
      }
      return false;
    }

    const token = payload?.data?.token;
    const username = payload?.data?.username;

    if (!token || !username) {
      return false;
    }

    persistSession(token, username, {
      email: getStoredUser()?.email,
      timestamp: payload?.meta?.timestamp,
    });

    return true;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
