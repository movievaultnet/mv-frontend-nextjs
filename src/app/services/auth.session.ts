export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
}

interface PersistSessionOptions {
  email?: string;
  timestamp?: string;
}

const TOKEN_KEY = 'movievault_token';
const USER_KEY = 'movievault_user';
const SIGNED_OUT_KEY = 'movievault_signed_out';
const TOKEN_EXPIRY_SKEW_SECONDS = 30;

// SSR guard — on the server (Node.js), localStorage does not exist
const isBrowser = typeof window !== 'undefined';

function storageGet(key: string): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}

function storageSet(key: string, value: string): void {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
}

function storageRemove(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}

function inferDisplayName(email: string, username?: string | null) {
  if (username && username.trim()) {
    return username.trim();
  }

  const localPart = email.split('@')[0] || 'MovieVault User';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeRole(role: unknown): User['role'] {
  if (role === 'ADMIN' || role === 'MODERATOR' || role === 'USER') {
    return role;
  }

  if (typeof role === 'string') {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === 'ADMIN' || normalizedRole === 'MODERATOR' || normalizedRole === 'USER') {
      return normalizedRole;
    }
  }

  return 'USER';
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, base64Payload] = token.split('.');
    if (!base64Payload) {
      return null;
    }

    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractPrimaryRole(jwtPayload: Record<string, unknown> | null): User['role'] {
  const roles = jwtPayload?.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    return normalizeRole(roles[0]);
  }

  return 'USER';
}

function deriveEmail(username: string, explicitEmail?: string) {
  if (explicitEmail && explicitEmail.trim()) {
    return explicitEmail.trim();
  }

  if (username.includes('@')) {
    return username;
  }

  return username || 'unknown-user';
}

export function persistSession(token: string, username: string, options: PersistSessionOptions = {}) {
  const jwtPayload = decodeJwtPayload(token);
  const subject = jwtPayload?.sub;
  const previousUser = getStoredUser();
  const email = deriveEmail(username, options.email ?? previousUser?.email);

  const user: User = {
    id: typeof subject === 'string' && subject.trim() ? subject : email,
    email,
    name: inferDisplayName(email, username),
    role: extractPrimaryRole(jwtPayload),
    emailVerified: previousUser?.emailVerified ?? true,
    avatar: previousUser?.avatar,
    createdAt: previousUser?.createdAt ?? options.timestamp ?? new Date().toISOString(),
  };

  storageSet(TOKEN_KEY, token);
  storageSet(USER_KEY, JSON.stringify(user));
  clearSignedOutMarker();

  return user;
}

export function clearSession() {
  storageRemove(TOKEN_KEY);
  storageRemove(USER_KEY);
}

export function markSignedOut() {
  clearSession();
  storageSet(SIGNED_OUT_KEY, 'true');
}

export function clearSignedOutMarker() {
  storageRemove(SIGNED_OUT_KEY);
}

export function isSignedOut() {
  return storageGet(SIGNED_OUT_KEY) === 'true';
}

export function getStoredToken(): string | null {
  return storageGet(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const userStr = storageGet(USER_KEY);
  return userStr ? JSON.parse(userStr) as User : null;
}

export function isTokenExpired(token: string) {
  const jwtPayload = decodeJwtPayload(token);
  const exp = jwtPayload?.exp;

  if (typeof exp !== 'number') {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds + TOKEN_EXPIRY_SKEW_SECONDS;
}

export function hasUsableSession() {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return false;
  }

  return !isTokenExpired(token);
}
