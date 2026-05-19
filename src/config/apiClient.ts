import API_BASE_URL from './api';

const API_KEY = import.meta.env.VITE_API_KEY || 'fashion-redemption-dev-key-2026';

/**
 * A wrapper around the native fetch API that automatically injects
 * the x-api-key header required by the backend.
 */
export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const headers = new Headers(init?.headers);
  
  // Only inject API key if we are calling our own backend
  const urlString = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
  if (urlString.startsWith(API_BASE_URL) || urlString.startsWith('/api')) {
    headers.set('x-api-key', API_KEY);
  }

  const newInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, newInit);
};

export default apiFetch;
