import axios from 'axios';
import { getApiUrl } from '@/env.config';

const API_BASE_URL = getApiUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000
});

export default api;