// API utility functions for handling base URLs
export const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use the same domain (Vercel handles routing)
    return window.location.origin;
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

export const getApiEndpoint = (endpoint: string) => {
  return `${getApiUrl()}/api${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  USERS: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
  },
  TASKS: '/tasks',
  FOCUS: '/focus',
} as const;
