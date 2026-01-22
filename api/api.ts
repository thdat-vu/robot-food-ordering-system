import axios from 'axios';
import { getApiUrl } from '@/env.config';
import { toast } from 'sonner';

const API_BASE_URL = getApiUrl();

const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
};

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000
});

// Request interceptor for token injection
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => {
        const { data } = response;
        // The backend commonly returns 200 OK with an error object in the body
        if (data && typeof data === 'object') {
            const statusCode = data.statusCode || data.statusCodes || data.status;
            const code = data.code || data.codes;
            const message = data.message || data.error;

            // Check if business logic indicates an error
            const isBusinessError =
                (code && String(code).toUpperCase() === "ERROR") ||
                (statusCode && Number(statusCode) >= 400);

            if (isBusinessError) {
                const displayMessage = message || "Đã xảy ra lỗi hệ thống";
                if (Number(statusCode) === 500) {
                    toast.error(`Lỗi hệ thống: ${displayMessage}`);
                } else {
                    toast.error(displayMessage);
                }
            }
        }
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            // Extract message from HTTP error response
            const message = data?.message || data?.error || error.message || "Đã xảy ra lỗi không xác định";

            if (status === 400) {
                toast.error(message);
            } else if (status === 401) {
                toast.error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
            } else if (status === 403) {
                toast.error("Bạn không có quyền thực hiện hành động này.");
            } else if (status === 500) {
                toast.error(`Lỗi hệ thống: ${message}`);
            } else {
                toast.error(`Lỗi (${status}): ${message}`);
            }
        } else if (error.request) {
            toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.");
        } else {
            toast.error(`Lỗi: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export default api;