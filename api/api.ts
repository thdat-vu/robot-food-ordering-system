import axios from 'axios';

// const PRODUCTION_API_URL = `http://localhost:5235`;
const PRODUCTION_API_URL = `https://be.qrcodeordering.duckdns.org/`;

const api = axios.create({
    baseURL: PRODUCTION_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - optimize requests
api.interceptors.request.use(
    (config) => {
        // Add cache control for GET requests
        if (config.method === 'get') {
            config.headers['Cache-Control'] = 'max-age=300'; // 5 minutes
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors efficiently
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        }
        return Promise.reject(error);
    }
);

export default api;