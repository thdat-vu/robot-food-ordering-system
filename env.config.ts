// Environment Configuration for Robot Food Ordering System
// This file defines the API URLs for different environments

export const ENV_CONFIG = {
  // Development environment
  development: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235/api'
  },
  
  // Production environment
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://be-robo.zd-dev.xyz/api'
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