import apiClient from '../axios';
import api from "@/api/api";
import {API_PAYMENT} from "@/api-endpoint-env";

export interface PaymentCreateRequest {
    moneyUnit?: string;
    orderId?: string;
    paymentContent?: string;
}

export interface PaymentUrlResponse {
    orderId: string;
    paymentStatus: string;
    paymentUrl?: string;
    message?: string;
}

export interface ApiBaseResponse<T> {
    statusCode: number;
    code: string;
    data: T;
    message?: string;
}

export interface OrderPaymentReturnResponse {
    orderId: string;
    paymentStatus: string | number;
    paymentUrl?: string | null;
    message?: string | null;
}

export const paymentsApi = {
    async createVNPayUrl(orderId: string, payload?: PaymentCreateRequest) {
        const body: PaymentCreateRequest = {
            moneyUnit: payload?.moneyUnit ?? 'VND',
            orderId,
            paymentContent:
                payload?.paymentContent ?? `Thanh toan don ${orderId}`,
        };

        const response = await apiClient.post<ApiBaseResponse<PaymentUrlResponse>>(
            `/Payment/create-url/${orderId}`,
            body
        );
        return response.data;
    },

    async handleVnPayReturn(queryString: string) {
        // queryString should be everything after '?'
        const url = `/Payment/vnpay-return${queryString ? `?${queryString}` : ''}`;
        const response = await apiClient.get<ApiBaseResponse<OrderPaymentReturnResponse>>(url);
        return response.data;
    },
};


export const Payment = async (orderId: string): Promise<any> => {
    try {
        const res = await api.post(`${API_PAYMENT}/create-link/${orderId}`, {}, {
            params: {
                isCustomer: false
            }
        });
        return res.data;
    } catch (err) {
        console.log(err);
    }
}
