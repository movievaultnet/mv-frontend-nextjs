export function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://mv-gateway';
  }

  const { protocol, hostname, port, origin } = window.location;

  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '5173') {
    return `${protocol}//${hostname}`;
  }

  return origin;
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
