const DEFAULT_PORT = 3001;

/**
 * PUBLIC_INTERFACE
 * getBackendUrl resolves the backend URL from env or defaults to same host with port 3001.
 */
export function getBackendUrl() {
  const explicit = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
  if (explicit && explicit.trim()) return explicit.trim();

  // derive from window location
  try {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${DEFAULT_PORT}`;
  } catch {
    return '';
  }
}

/**
 * PUBLIC_INTERFACE
 * getFeatureFlags parses REACT_APP_FEATURE_FLAGS JSON into an object.
 */
export function getFeatureFlags() {
  const raw = process.env.REACT_APP_FEATURE_FLAGS;
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}
