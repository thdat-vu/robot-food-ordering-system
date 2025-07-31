import axios from 'axios';

const PRODUCTION_API_URL = `http://localhost:5235`;

const api = axios.create({
    baseURL: PRODUCTION_API_URL,
    timeout: 10000
});

export default api;