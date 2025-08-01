import axios from 'axios';

const PRODUCTION_API_URL = `https://be-robo.zd-dev.xyz`;

const api = axios.create({
    baseURL: PRODUCTION_API_URL,
    timeout: 10000
});

export default api;