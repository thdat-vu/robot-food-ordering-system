// Environment Configuration for Robot Food Ordering System
// This file defines the API URLs for different environments

export const ENV_CONFIG = {
  // Development environment
  development: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://be.qrcodeordering.duckdns.org/api'
  },
  
  // Production environment
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://be.qrcodeordering.duckdns.org/api'
  },
  
  // Test environment
  test: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235/api'
  }
};

// Get current environment
export const getCurrentEnv = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use NODE_ENV or default to development
    return process.env.NODE_ENV || 'development';
  }
  // Server-side: use NODE_ENV or default to development
  return process.env.NODE_ENV || 'development';
};

// Get API URL for current environment
export const getApiUrl = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG]?.API_URL || ENV_CONFIG.development.API_URL;
};

// Get base URL (without /api suffix) for SignalR
// Example: https://be.qrcodeordering.duckdns.org/api -> https://be.qrcodeordering.duckdns.org
export const getBaseUrl = (): string => {
  const apiUrl = getApiUrl();
  // Remove /api suffix if present
  return apiUrl.replace(/\/api\/?$/, '');
};

// Get SignalR Hub URL
// Example: getSignalRHubUrl('/hubs/customer-table') 
// Returns: https://be.qrcodeordering.duckdns.org/hubs/customer-table
export const getSignalRHubUrl = (hubPath: string): string => {
  const baseUrl = getBaseUrl();
  // Ensure hubPath starts with /
  const normalizedPath = hubPath.startsWith('/') ? hubPath : `/${hubPath}`;
  return `${baseUrl}${normalizedPath}`;
};

// Predefined SignalR Hub URLs
export const SIGNALR_HUBS = {
  ORDER_NOTIFICATION: '/orderNotificationHub',
  CUSTOMER_TABLE: '/hubs/customer-table',
  MODERATOR_DASHBOARD: 'hubs/moderator-dashboard',
  ADMIN_DASHBOARD: 'hubs/admin-dashboard',
} as const;

// Helper to get full SignalR hub URL
export const getSignalRHubUrlByName = (hubName: keyof typeof SIGNALR_HUBS): string => {
  return getSignalRHubUrl(SIGNALR_HUBS[hubName]);
}; 