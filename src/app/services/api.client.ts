import { buildApiUrl } from './api.config';

export async function parseJsonSafely(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export interface CoreFetchOptions extends RequestInit {
  // Add any core options here if needed
}

export async function coreFetch(path: string, options: CoreFetchOptions = {}) {
  const { headers, ...init } = options;
  
  return fetch(buildApiUrl(path), {
    ...init,
    credentials: 'include',
    headers,
  });
}
