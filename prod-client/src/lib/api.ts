// API utility functions

export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL;
};

export const getApiEndpoint = (endpoint: string) => {
  return `${getApiUrl()}/api${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  USERS: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
  },
  TASKS: "/tasks",
  FOCUS: "/focus",
} as const;